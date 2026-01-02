import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import type {User as SupabaseUser, Session} from '@supabase/supabase-js';
import {supabase} from '../../config/supabase';
import {getEntreefederatieDomain} from '../../config/entreefederatie';
import {ENVIRONMENT} from '../constants';
import {getUserRole} from '../utils/userRole';
import type {UserRole} from '../types/admin.types';

// Firebase User-compatible interface for backward compatibility
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  remainingCredits?: number; // Remaining credits for current period
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isDevelopmentMode: boolean;
  isSessionOnly: boolean;
  toggleDevelopmentMode: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEntreefederatie: () => Promise<void>;
  logout: () => Promise<void>;
  canEnableDevelopmentMode: boolean;
  signInInProgress: boolean; // Indicates if sign-in redirect is in progress
  refreshCredits: () => Promise<void>; // Refresh user credits from database
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Storage key for consistent anonymous user ID across tabs (like Firebase)
const ANONYMOUS_USER_ID_KEY = 'supabase_anonymous_user_id';
const ANONYMOUS_SESSION_LOCK_KEY = 'supabase_anonymous_session_lock';
const LOCK_TIMEOUT_MS = 5000; // 5 seconds lock timeout

/**
 * Detects if the current page load is returning from an OAuth/SAML redirect.
 * Supabase uses various URL parameters to indicate auth callbacks.
 * When detected, we should NOT create anonymous sessions as the real auth is in progress.
 */
const isOAuthRedirectInProgress = (): boolean => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const hash = url.hash;

  // Check for OAuth/SAML callback parameters
  // - code: OAuth authorization code (used by Supabase SAML SSO)
  // - access_token: Implicit flow token in hash (Google OAuth)
  // - error: OAuth error response
  // - error_description: OAuth error details
  const hasCode = searchParams.has('code');
  const hasError = searchParams.has('error');
  const hasAccessTokenInHash =
    hash.includes('access_token') || hash.includes('refresh_token');

  return hasCode || hasError || hasAccessTokenInHash;
};

// Shared session cache for use across contexts
// This is a module-level cache that can be shared between AuthContext and AssistantsContext
let sharedSessionCache: {
  session: Session | null;
  timestamp: number;
} | null = null;
const SESSION_CACHE_TTL = 1000; // 1 second cache

/**
 * Gets cached session or fetches fresh session if cache is invalid/missing
 * Shared utility that can be used by multiple contexts
 */
export const getCachedSessionShared = async (): Promise<Session | null> => {
  const now = Date.now();
  const cache = sharedSessionCache;

  // Check if cache is valid (exists and within TTL)
  if (cache && cache.timestamp && now - cache.timestamp < SESSION_CACHE_TTL) {
    return cache.session;
  }

  // Cache invalid or missing - fetch fresh session
  try {
    const {
      data: {session},
    } = await supabase.auth.getSession();

    sharedSessionCache = {session, timestamp: now};
    return session;
  } catch (error) {
    // If getSession fails (e.g., CORS error, network issue), log with details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError =
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Connection failed');

    console.error('[AuthContext] Failed to get session:', {
      error: errorMessage,
      isNetworkError,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
    });
    // Return cached session if available, otherwise null
    return cache?.session || null;
  }
};

/**
 * Invalidates the shared session cache
 * Call this when auth state changes to ensure fresh session data
 */
export const invalidateSessionCacheShared = (): void => {
  sharedSessionCache = null;
};

/**
 * Gets or creates a consistent anonymous user ID stored in localStorage
 * This ensures all tabs use the same anonymous user ID
 */
const getStoredAnonymousUserId = (): string | null => {
  try {
    return localStorage.getItem(ANONYMOUS_USER_ID_KEY);
  } catch (error) {
    console.warn(
      '[AuthContext] Failed to read stored anonymous user ID:',
      error,
    );
    return null;
  }
};

/**
 * Stores the anonymous user ID in localStorage for consistency across tabs
 */
const storeAnonymousUserId = (userId: string): void => {
  try {
    localStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
  } catch (error) {
    console.warn('[AuthContext] Failed to store anonymous user ID:', error);
  }
};

/**
 * Clears the stored anonymous user ID (e.g., when user signs in)
 */
const clearStoredAnonymousUserId = (): void => {
  try {
    localStorage.removeItem(ANONYMOUS_USER_ID_KEY);
  } catch (error) {
    console.warn(
      '[AuthContext] Failed to clear stored anonymous user ID:',
      error,
    );
  }
};

/**
 * Clears all user-specific localStorage data on sign out
 * This prevents stale data from persisting after logout
 * Optimized to use single-pass iteration instead of multiple loops
 */
const clearUserLocalStorage = (): void => {
  try {
    // Exact keys to remove
    const exactKeys = [
      'selectedAssistant',
      'defaultAssistantId',
      'gamma:jobs:v1',
      'devMode',
      ANONYMOUS_SESSION_LOCK_KEY,
    ];

    // Collect all keys to remove in a single pass
    const keysToRemove: string[] = [];
    const patternMatches: Record<string, number> = {
      draftKeys: 0,
      lastOpenedKeys: 0,
      snapshotKeys: 0,
      supabaseTokens: 0,
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Check exact keys
      if (exactKeys.includes(key)) {
        keysToRemove.push(key);
        continue;
      }

      // Check prefix patterns
      if (key.startsWith('chatDraft:v1:')) {
        keysToRemove.push(key);
        patternMatches.draftKeys++;
      } else if (key.startsWith('lastOpenedChat:v1:')) {
        keysToRemove.push(key);
        patternMatches.lastOpenedKeys++;
      } else if (key.startsWith('chatPendingSnapshot:')) {
        keysToRemove.push(key);
        patternMatches.snapshotKeys++;
      } else if (key.includes('supabase') && key.includes('auth-token')) {
        keysToRemove.push(key);
        patternMatches.supabaseTokens++;
      }
    }

    // Remove all collected keys at once
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('[AuthContext] Failed to clear user localStorage:', error);
  }
};

/**
 * Attempts to acquire a lock for creating an anonymous session
 * Returns true if lock was acquired, false if another tab is creating a session
 */
const acquireSessionLock = (): boolean => {
  try {
    const lockData = localStorage.getItem(ANONYMOUS_SESSION_LOCK_KEY);
    if (lockData) {
      const lock = JSON.parse(lockData);
      const lockAge = Date.now() - lock.timestamp;
      // If lock is older than timeout, consider it stale and take it
      if (lockAge < LOCK_TIMEOUT_MS) {
        return false; // Another tab is creating a session
      }
    }
    // Acquire lock
    localStorage.setItem(
      ANONYMOUS_SESSION_LOCK_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        tabId: Math.random().toString(36),
      }),
    );
    return true;
  } catch (error) {
    console.warn('[AuthContext] Failed to acquire session lock:', error);
    return true; // Proceed anyway if lock mechanism fails
  }
};

/**
 * Releases the session lock
 */
const releaseSessionLock = (): void => {
  try {
    localStorage.removeItem(ANONYMOUS_SESSION_LOCK_KEY);
  } catch (error) {
    console.warn('[AuthContext] Failed to release session lock:', error);
  }
};

/**
 * Extracts the Entreefederatie SAML subject identifier (sub) from user data.
 * 
 * Entreefederatie sends a hashed/anonymized identifier in the SAML `sub` attribute,
 * which Supabase stores in `identity_data.sub` and `identities[0].id`.
 * This identifier is preserved even if the email field changes.
 * 
 * IMPORTANT: The `sub` value is ALWAYS preserved in `identity_data.sub` and `identities[0].id`,
 * even if the user changes their email. The email field may contain the hashed sub value,
 * but the original sub is safe in identity_data.
 * 
 * @param supabaseUser The Supabase user object
 * @returns The Entreefederatie sub identifier, or null if not an Entreefederatie user
 */
export function getEntreefederatieSub(supabaseUser: SupabaseUser): string | null {
  // Check if this is an Entreefederatie user
  const provider = supabaseUser.app_metadata?.provider || '';
  const isSSOProvider = provider.startsWith('sso:');
  const isKennisnetEmail =
    supabaseUser.email?.endsWith('@kennisnet.org') || false;
  const hasEntreefederatieProvider =
    isSSOProvider ||
    supabaseUser.identities?.some(id => id.provider === 'keycloak') ||
    isKennisnetEmail;

  if (!hasEntreefederatieProvider) {
    return null;
  }

  // Extract sub from identity_data (preserved SAML attribute)
  // Priority: identity_data.sub > identities[0].id > user_metadata.sub
  const identityData = supabaseUser.identities?.[0]?.identity_data;
  if (identityData?.sub) {
    return identityData.sub as string;
  }

  // Fallback to identities[0].id (also contains sub)
  if (supabaseUser.identities?.[0]?.id) {
    return supabaseUser.identities[0].id;
  }

  // Fallback to user_metadata.sub (if present)
  if (supabaseUser.user_metadata?.sub) {
    return supabaseUser.user_metadata.sub as string;
  }

  return null;
}

/**
 * Converts Supabase user to Firebase-compatible User interface
 */
function supabaseUserToFirebaseUser(supabaseUser: SupabaseUser): User {
  // Check multiple ways Supabase might indicate anonymous users
  const hasAnonymousProvider =
    supabaseUser.app_metadata?.provider === 'anonymous' ||
    supabaseUser.identities?.some(id => id.provider === 'anonymous');

  // Check for Entreefederatie provider
  // SAML SSO providers use format 'sso:<provider-id>'
  // Also check for @kennisnet.org email domain as indicator
  const provider = supabaseUser.app_metadata?.provider || '';
  const isSSOProvider = provider.startsWith('sso:');
  const isKennisnetEmail =
    supabaseUser.email?.endsWith('@kennisnet.org') || false;
  const hasEntreefederatieProvider =
    isSSOProvider || // SAML SSO provider
    provider === 'keycloak' || // Legacy Keycloak provider
    supabaseUser.identities?.some(id => id.provider === 'keycloak') ||
    isKennisnetEmail; // Email domain indicator

  // Anonymous users have no email and no display name
  // Entreefederatie users may also have no email (GDPR compliance)
  // Note: Entreefederatie "email" field contains a hashed identifier (sub), not a real email
  const isAnonymous =
    !hasEntreefederatieProvider &&
    !supabaseUser.email &&
    !supabaseUser.user_metadata?.full_name &&
    !supabaseUser.user_metadata?.name &&
    !supabaseUser.user_metadata?.givenName &&
    (hasAnonymousProvider || !supabaseUser.email);

  // Extract name from various possible locations
  // Entreefederatie SAML stores name in custom_claims nested object
  const customClaims =
    supabaseUser.user_metadata?.custom_claims ||
    supabaseUser.identities?.[0]?.identity_data?.custom_claims ||
    null;

  // Check multiple locations for first_name/last_name
  const firstName =
    customClaims?.first_name ||
    supabaseUser.user_metadata?.first_name ||
    supabaseUser.user_metadata?.givenName;
  const lastName =
    customClaims?.last_name ||
    supabaseUser.user_metadata?.last_name ||
    supabaseUser.user_metadata?.sn; // SAML 'sn' attribute

  const combinedName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || null;

  const displayName =
    customClaims?.full_name ||
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.user_metadata?.name ||
    combinedName || // SAML users: first_name + last_name or givenName + last_name
    customClaims?.first_name || // Fallback to custom_claims.first_name alone
    supabaseUser.user_metadata?.givenName || // Fallback to givenName alone
    null;

  // Return Firebase User object
  // Note: For Entreefederatie users, the email field contains a hashed identifier (sub),
  // not a real email address. The original sub is preserved in identity_data.sub
  // and can be retrieved using getEntreefederatieSub().
  const user = {
    uid: supabaseUser.id,
    email: supabaseUser.email || null, // For Entreefederatie: contains hashed sub, not real email
    displayName,
    photoURL:
      supabaseUser.user_metadata?.avatar_url ||
      supabaseUser.user_metadata?.picture ||
      null,
    isAnonymous,
  };

  return user;
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousUserRef = useRef<User | null>(null);
  const anonymousUserIdRef = useRef<string | null>(null); // Track anonymous user ID for cross-tab consistency
  const signInInFlightRef = useRef(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Session cache to reduce redundant getSession() calls
  // Uses shared cache defined at module level
  const sessionCacheRef = useRef<{
    session: Session | null;
    timestamp: number;
  } | null>(null);

  const [isDevelopmentModeLocal, setIsDevelopmentModeLocal] = useState(() => {
    return localStorage.getItem('devMode') === 'true';
  });

  // Fetch user role from database when user changes
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setUserRole(null);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const {data, error} = await supabase
          .from('users')
          .select('role')
          .eq('id', user.uid)
          .single();

        if (error) {
          console.error('[AuthContext] Failed to fetch user role:', error);
          // Fallback: use getUserRole with null userData (will check email only)
          const fallbackRole = getUserRole(user.email, null);
          setUserRole(fallbackRole);
          return;
        }

        const role = getUserRole(user.email, data);
        setUserRole(role);
      } catch (err) {
        console.error(
          '[AuthContext] Unexpected error fetching user role:',
          err,
        );
        // Fallback: use getUserRole with null userData (will check email only)
        const fallbackRole = getUserRole(user.email, null);
        setUserRole(fallbackRole);
      }
    };

    void fetchUserRole();
  }, [user]);

  const hasAdminRole = userRole === 'admin' || userRole === 'super-admin';

  const canEnableDevelopmentMode =
    ENVIRONMENT.isAllowedDomain(user?.email) || hasAdminRole;

  /**
   * Gets cached session or fetches fresh session if cache is invalid/missing
   * Uses shared cache and also updates component-level cache
   * Reduces redundant getSession() API calls
   */
  const getCachedSession = async (): Promise<Session | null> => {
    const session = await getCachedSessionShared();
    // Also update component-level cache for consistency
    sessionCacheRef.current = {
      session,
      timestamp: Date.now(),
    };
    return session;
  };

  /**
   * Invalidates the session cache
   * Call this when auth state changes to ensure fresh session data
   */
  const invalidateSessionCache = (): void => {
    invalidateSessionCacheShared();
    sessionCacheRef.current = null;
  };

  // Function to refresh credits (can be called after usage updates)
  const refreshCredits = async (): Promise<void> => {
    if (!user || user.isAnonymous) {
      return;
    }

    try {
      const {data, error} = await supabase
        .from('users')
        .select('remaining_credits')
        .eq('id', user.uid)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to refresh credits:', error);
        return;
      }

      if (data?.remaining_credits !== undefined) {
        setUser(prevUser =>
          prevUser
            ? {...prevUser, remainingCredits: data.remaining_credits}
            : null,
        );
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error refreshing credits:', err);
    }
  };

  // Use ref to track loading state for timeout check (avoids stale closure)
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    // Safety timeout: ensure loading is set to false after maximum wait time
    // This prevents infinite loading if auth initialization fails silently
    const loadingTimeout = setTimeout(() => {
      // Use ref to get current loading state (avoids stale closure)
      if (loadingRef.current) {
        console.warn(
          '[AuthContext] ⚠️ Auth initialization timeout - forcing loading to false',
        );
        setLoading(false);
      }
    }, 10000); // 10 second maximum wait

    // Listen for storage events to detect when another tab creates an anonymous session
    const handleStorageChange = async (e: StorageEvent): Promise<void> => {
      // Supabase stores sessions in localStorage with keys like 'sb-<project>-auth-token'
      // When a session is created in another tab, we should detect it
      if (e.key && e.key.includes('auth-token') && e.newValue) {
        // Wait a moment for Supabase to process the storage change
        await new Promise(resolve => setTimeout(resolve, 100));

        // Invalidate cache since storage changed
        invalidateSessionCache();

        // Check if we now have a session
        const session = await getCachedSession();
        if (session?.user) {
          const firebaseUser = supabaseUserToFirebaseUser(session.user);
          if (firebaseUser.isAnonymous) {
            // Another tab created an anonymous session - use it
            storeAnonymousUserId(firebaseUser.uid);
            anonymousUserIdRef.current = firebaseUser.uid;
            setUser(null);
            setLoading(false);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Get initial session with timeout protection
    // Wrap getCachedSession in a timeout to prevent hanging
    const sessionPromise = Promise.race([
      getCachedSession(),
      new Promise<null>(
        resolve =>
          setTimeout(() => {
            console.warn(
              '[AuthContext] getCachedSession timeout - assuming no session',
            );
            resolve(null);
          }, 3000), // 3 second timeout
      ),
    ]);
    void sessionPromise
      .then(async session => {
        if (session?.user) {
          const firebaseUser = supabaseUserToFirebaseUser(session.user);

          // If this is an anonymous user, store the ID for consistency across tabs
          if (firebaseUser.isAnonymous) {
            storeAnonymousUserId(firebaseUser.uid);
            anonymousUserIdRef.current = firebaseUser.uid;
          } else {
            // Clear stored anonymous ID when authenticated user signs in
            clearStoredAnonymousUserId();
          }

          // Set user to null if anonymous (matches Firebase behavior - anonymous users don't show as logged in)
          setUser(firebaseUser.isAnonymous ? null : firebaseUser);
          setLoading(false);
        } else {
          // No session - check if we're returning from OAuth/SAML redirect first
          const oauthRedirectInProgress = isOAuthRedirectInProgress();

          if (oauthRedirectInProgress) {
            // OAuth/SAML redirect detected - DO NOT create anonymous session
            // Wait for Supabase to process the auth code and fire onAuthStateChange
            // Also don't call signInAnonymously() - that would overwrite the incoming session
            // BUT: Add a safety timeout in case onAuthStateChange never fires (network issues)
            setTimeout(() => {
              if (loadingRef.current) {
                console.warn(
                  '[AuthContext] ⚠️ OAuth redirect timeout - forcing loading to false',
                );
                setLoading(false);
              }
            }, 5000); // 5 second timeout for OAuth processing
            return;
          }

          // No session - check for stored anonymous user ID first
          const storedAnonymousId = getStoredAnonymousUserId();

          if (storedAnonymousId) {
            // Wait a bit for other tabs to potentially restore the session
            // This helps with race conditions when multiple tabs open simultaneously
            await new Promise(resolve => setTimeout(resolve, 200));

            // Invalidate cache before recheck
            invalidateSessionCache();

            // Check again if session was restored by another tab
            try {
              const recheckSession = await getCachedSession();

              if (recheckSession?.user) {
                const firebaseUser = supabaseUserToFirebaseUser(
                  recheckSession.user,
                );
                if (
                  firebaseUser.isAnonymous &&
                  firebaseUser.uid === storedAnonymousId
                ) {
                  // Session restored - use it
                  anonymousUserIdRef.current = firebaseUser.uid;
                  setUser(null);
                  setLoading(false);
                  return;
                }
              }
            } catch (recheckError) {
              console.error(
                '[AuthContext] Error during session recheck:',
                recheckError,
              );
              // Continue to anonymous sign-in attempt
            }
          }

          // No valid session found - sign in anonymously for backend operations, but keep user as null
          // Wrap signInAnonymously in timeout to prevent hanging on network errors
          const signInPromise = Promise.race([
            signInAnonymously(),
            new Promise<void>(
              resolve =>
                setTimeout(() => {
                  console.warn(
                    '[AuthContext] signInAnonymously timeout (no session path) - setting loading to false',
                  );
                  setLoading(false);
                  resolve();
                }, 5000), // 5 second timeout
            ),
          ]);
          void signInPromise.catch(() => {
            console.warn(
              '[AuthContext] signInAnonymously failed (no session path) - setting loading to false',
            );
            setLoading(false);
          });
        }
      })
      .catch(error => {
        // Handle errors from getCachedSession (e.g., CORS, network issues)
        console.error('[AuthContext] Failed to get initial session:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to initialize authentication',
        );
        // Still try to sign in anonymously, but set loading to false if that also fails
        // Wrap signInAnonymously in a timeout to prevent hanging on network errors
        const signInPromise = Promise.race([
          signInAnonymously(),
          new Promise<void>(
            resolve =>
              setTimeout(() => {
                console.warn(
                  '[AuthContext] signInAnonymously timeout - setting loading to false',
                );
                resolve();
              }, 5000), // 5 second timeout
          ),
        ]);
        void signInPromise
          .catch(() => {
            // If anonymous sign-in also fails, ensure loading is set to false
            setLoading(false);
          })
          .finally(() => {
            // Ensure loading is false even if signInAnonymously succeeds but doesn't set it
            // This is a safety net for network issues
            setTimeout(() => {
              if (loadingRef.current) {
                console.warn(
                  '[AuthContext] signInAnonymously completed but loading still true - forcing false',
                );
                setLoading(false);
              }
            }, 100);
          });
      });

    // Listen for auth changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Invalidate cache on any auth state change
      invalidateSessionCache();

      const meta = import.meta as unknown as {env?: {DEV?: boolean}};
      // Skip INITIAL_SESSION if we already have a user (prevents duplicate processing)
      if (event === 'INITIAL_SESSION' && user) {
        return;
      }

      const previousUser = previousUserRef.current;

      if (session?.user) {
        const currentUser = supabaseUserToFirebaseUser(session.user);

        // Only treat non-anonymous users as logged in (matches Firebase behavior)
        if (!currentUser.isAnonymous) {
          // Skip if same user (prevents duplicate processing)
          if (
            previousUser?.uid === currentUser.uid &&
            event === 'INITIAL_SESSION'
          ) {
            return;
          }

          previousUserRef.current = currentUser;
          // Clear stored anonymous ID when authenticated user signs in
          clearStoredAnonymousUserId();

          // Clean up OAuth/SAML redirect parameters from URL
          // This prevents stale code parameters from causing issues on refresh
          if (isOAuthRedirectInProgress()) {
            const cleanUrl = `${window.location.origin}${window.location.pathname}`;
            window.history.replaceState({}, document.title, cleanUrl);
          }

          setUser(currentUser);
          setLoading(false);
        } else {
          // Anonymous user - treat as not logged in (set user to null)
          // Anonymous session exists for backend operations, but UI shows "Sign in"
          // Store the anonymous user ID for consistency across tabs
          storeAnonymousUserId(currentUser.uid);
          anonymousUserIdRef.current = currentUser.uid;
          setUser(null);
          setLoading(false);
        }
      } else {
        // User signed out - check if we should create a new anonymous user
        const storedAnonymousId = getStoredAnonymousUserId();

        // Only create new anonymous user if we don't have a stored one
        // This prevents creating duplicate users when session expires but we have a stored ID
        if (!storedAnonymousId) {
          previousUserRef.current = null;
          setUser(null);
          setLoading(true);
          await signInAnonymously();
        } else {
          // We have a stored ID but no session - this might be a session expiration
          // Don't create a new user, just set loading to false
          // The stored ID will be used for backend operations
          previousUserRef.current = null;
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const signInAnonymously = async (): Promise<void> => {
    // Check if we already have a stored anonymous user ID
    const storedAnonymousId = getStoredAnonymousUserId();

    // If we have a stored ID, check if current session matches it
    if (storedAnonymousId) {
      const session = await getCachedSession();

      if (session?.user) {
        const firebaseUser = supabaseUserToFirebaseUser(session.user);
        if (
          firebaseUser.isAnonymous &&
          firebaseUser.uid === storedAnonymousId
        ) {
          // We already have the correct anonymous session
          anonymousUserIdRef.current = firebaseUser.uid;
          setUser(null);
          setLoading(false);
          return;
        }
      }
    }

    // Try to acquire lock to prevent multiple tabs from creating sessions simultaneously
    const hasLock = acquireSessionLock();

    if (!hasLock) {
      // Another tab is creating a session - wait and check again
      await new Promise(resolve => setTimeout(resolve, 500));
      // Invalidate cache before checking
      invalidateSessionCache();
      const session = await getCachedSession();
      if (session?.user) {
        const firebaseUser = supabaseUserToFirebaseUser(session.user);
        if (firebaseUser.isAnonymous) {
          // Session was created by another tab - use it
          storeAnonymousUserId(firebaseUser.uid);
          anonymousUserIdRef.current = firebaseUser.uid;
          setUser(null);
          setLoading(false);
          return;
        }
      }
      // If still no session, proceed to create one (lock may have been stale)
    }

    try {
      const {data, error: anonError} = await supabase.auth.signInAnonymously();

      // Release lock after attempting to create session
      releaseSessionLock();

      if (anonError) {
        // If anonymous auth is disabled, just set loading to false
        // User can still sign in with Google
        if (
          anonError.message?.includes('disabled') ||
          anonError.message?.includes('Anonymous')
        ) {
          setLoading(false);
          return;
        }
        throw anonError;
      }
      if (data.user) {
        const firebaseUser = supabaseUserToFirebaseUser(data.user);
        // Store the anonymous user ID for consistency across tabs
        storeAnonymousUserId(firebaseUser.uid);
        // Don't set user for anonymous - keep it null so UI shows "Sign in"
        // Anonymous auth session exists for backend operations (saving conversations)
        // but UI should treat anonymous users as not logged in (matches Firebase behavior)
        anonymousUserIdRef.current = firebaseUser.uid;
        setUser(null);
        setLoading(false);
      }
    } catch (err) {
      // Release lock on error
      releaseSessionLock();
      console.error('[AuthContext] Failed to sign in anonymously:', err);
      // Don't set error for disabled anonymous auth - it's expected
      if (!(err instanceof Error && err.message?.includes('disabled'))) {
        setError(
          err instanceof Error ? err.message : 'Failed to sign in anonymously',
        );
      }
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    if (signInInFlightRef.current) {
      console.warn(
        '[AuthContext] signInWithGoogle ignored - already in flight',
      );
      return;
    }
    signInInFlightRef.current = true;
    try {
      setLoading(true);

      // Sign in with Google
      // Note: Ensure Supabase Redirect URLs include wildcards (e.g., https://domain.com/**)
      // IMPORTANT: Clean URL hash before OAuth to prevent double-hash issue
      // Using window.location.href can cause ##hash problems when OAuth tokens are appended
      const redirectUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

      const {error: signInError} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (signInError) throw signInError;

      // Auth state change handler will update user
    } catch (err) {
      console.error('[AuthContext] signInWithGoogle error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to sign in with Google',
      );
      throw err;
    } finally {
      setLoading(false);
      signInInFlightRef.current = false;
    }
  };

  const signInWithEntreefederatie = async (): Promise<void> => {
    if (signInInFlightRef.current) {
      console.warn(
        '[AuthContext] signInWithEntreefederatie ignored - already in flight',
      );
      return;
    }
    signInInFlightRef.current = true;
    try {
      setLoading(true);

      // Sign in with Entreefederatie via Supabase SAML SSO
      // This uses the SAML provider we configured in Supabase
      // Use current origin to ensure redirect goes to correct environment
      // Note: Supabase may ignore redirectTo if Site URL is set, but we try anyway
      const redirectUrl = `${window.location.origin}/chat`;

      const {data, error: ssoError} = await supabase.auth.signInWithSSO({
        domain: getEntreefederatieDomain(),
        options: {
          redirectTo: redirectUrl,
          // Try to force redirect to current origin
          queryParams: {
            redirect_to: redirectUrl,
          },
        },
      });

      if (ssoError) {
        console.error('[AuthContext] SAML SSO error:', ssoError);
        throw ssoError;
      }

      if (data?.url) {
        // Redirect to Entreefederatie SAML endpoint
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL returned from SAML SSO');
      }

      // User will be redirected back after authentication
      // Supabase will handle user creation/update automatically
    } catch (err) {
      console.error('[AuthContext] signInWithEntreefederatie error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to sign in with Entreefederatie',
      );
      throw err;
    } finally {
      setLoading(false);
      signInInFlightRef.current = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      // Clear all user-specific localStorage data before signing out
      // This prevents stale data from persisting after logout
      clearUserLocalStorage();

      // Clear stored anonymous ID on logout (new anonymous session will be created)
      clearStoredAnonymousUserId();

      // Invalidate cache before checking session
      invalidateSessionCache();

      // Check if there's an active session before attempting to sign out
      const session = await getCachedSession();

      if (session && session.access_token) {
        // Try signOut with local scope first (less restrictive)
        let signOutError = null;
        try {
          const result = await supabase.auth.signOut({scope: 'local'});
          signOutError = result.error;
        } catch (localError) {
          // If local scope fails, try without scope (defaults to global)
          if (meta.env?.DEV) {
            console.warn(
              '[AuthContext] Local scope signOut failed, trying default:',
              localError,
            );
          }
          const result = await supabase.auth.signOut();
          signOutError = result.error;
        }

        if (signOutError) {
          // Log error but continue - we'll force state update
          console.warn(
            '[AuthContext] signOut error (will force state update):',
            signOutError,
          );
        }
      }

      // Force state update to anonymous even if signOut failed
      // This ensures the UI reflects the logout state
      setUser(null);
      previousUserRef.current = null;
      // Clear dev mode state (localStorage already cleared by clearUserLocalStorage)
      setIsDevelopmentModeLocal(false);
      // Invalidate cache after logout
      invalidateSessionCache();

      // Note: Supabase token cleanup is now handled in clearUserLocalStorage()
    } catch (err) {
      // Log error but don't throw - cleanup is more important
      console.error('[AuthContext] logout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      // Force state update even on error
      setUser(null);
      previousUserRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const toggleDevelopmentMode = async (): Promise<void> => {
    if (!user || user.isAnonymous) {
      return;
    }

    // Fetch role lokaal, net zoals andere features doen (Gamma, TTS, STT)
    try {
      const {data: userData, error} = await supabase
        .from('users')
        .select('role')
        .eq('id', user.uid)
        .single();

      if (error) {
        console.error(
          '[AuthContext] Failed to fetch user role for dev mode:',
          error,
        );
        // Fallback: use email check only
        const canEnable = ENVIRONMENT.isAllowedDomain(user.email);
        if (!canEnable) {
          console.warn(
            '[AuthContext] Development mode cannot be enabled - requirements not met for user:',
            user.email,
          );
          return;
        }
      } else {
        const userRole = getUserRole(user.email, userData);
        const hasAdminRole = userRole === 'admin' || userRole === 'super-admin';
        const canEnable =
          ENVIRONMENT.isAllowedDomain(user.email) || hasAdminRole;

        if (!canEnable) {
          console.warn(
            '[AuthContext] Development mode cannot be enabled - requirements not met for user:',
            user.email,
          );
          return;
        }
      }

      // Toggle dev mode
      setIsDevelopmentModeLocal(prev => !prev);
    } catch (err) {
      console.error(
        '[AuthContext] Unexpected error checking dev mode permissions:',
        err,
      );
      // Fallback: use email check only
      const canEnable = ENVIRONMENT.isAllowedDomain(user.email);
      if (!canEnable) {
        console.warn(
          '[AuthContext] Development mode cannot be enabled - requirements not met for user:',
          user.email,
        );
        return;
      }
      setIsDevelopmentModeLocal(prev => !prev);
    }
  };

  // Persist devMode to localStorage when state changes (simpel patroon zoals SelectedAssistantContext)
  useEffect(() => {
    if (isDevelopmentModeLocal) {
      localStorage.setItem('devMode', 'true');
    } else {
      localStorage.removeItem('devMode');
    }
  }, [isDevelopmentModeLocal]);

  // Expose debug functions to window for console inspection
  useEffect(() => {
    // Debug function for general auth inspection
    (window as unknown as {debugAuth?: () => Promise<void>}).debugAuth =
      async () => {
        try {
          const session = await supabase.auth.getSession();
          if (session.data.session?.user) {
            const supabaseUser = session.data.session.user;
            const convertedUser = supabaseUserToFirebaseUser(supabaseUser);
            console.log('[AuthContext] 🔍 Current user:', convertedUser);
            console.log('[AuthContext] 🔍 Supabase user:', supabaseUser);
          } else {
            console.log('[AuthContext] ⚠️ No active session');
          }
        } catch (error) {
          console.error('[AuthContext] ❌ Error inspecting auth:', error);
        }
      };

    // Debug function for Entreefederatie SAML inspection
    (window as unknown as {debugSAML?: () => Promise<void>}).debugSAML =
      async () => {
        try {
          const session = await supabase.auth.getSession();
          if (!session.data.session?.user) {
            console.log('[AuthContext] ⚠️ No active session. Please log in first.');
            return;
          }

          const supabaseUser = session.data.session.user;
          const entreefederatieSub = getEntreefederatieSub(supabaseUser);

          console.log('🔍 ===== SAML ATTRIBUTE INSPECTION =====');
          console.log('Is Entreefederatie user:', entreefederatieSub !== null);
          console.log('');

          console.log('📧 === EMAIL (top-level) ===');
          console.log('Email:', supabaseUser.email);
          console.log('Email type:', typeof supabaseUser.email);
          console.log('');

          console.log('📋 === USER_METADATA ===');
          console.log(JSON.stringify(supabaseUser.user_metadata, null, 2));
          console.log('');

          console.log('🏷️ === CUSTOM_CLAIMS (user_metadata) ===');
          console.log(
            JSON.stringify(
              supabaseUser.user_metadata?.custom_claims || null,
              null,
              2,
            ),
          );
          console.log('');

          console.log('🔐 === IDENTITIES ARRAY ===');
          console.log('Number of identities:', supabaseUser.identities?.length || 0);
          if (supabaseUser.identities && supabaseUser.identities.length > 0) {
            console.log(
              JSON.stringify(supabaseUser.identities, null, 2),
            );
          }
          console.log('');

          console.log('📦 === IDENTITY_DATA (raw SAML attributes) ===');
          const identityData = supabaseUser.identities?.[0]?.identity_data;
          if (identityData) {
            console.log(
              'Provider:',
              supabaseUser.identities?.[0]?.provider || 'unknown',
            );
            console.log('Identity Data:', JSON.stringify(identityData, null, 2));
          } else {
            console.log('No identity_data found');
          }
          console.log('');

          console.log('🏷️ === CUSTOM_CLAIMS (identity_data) ===');
          console.log(
            JSON.stringify(
              identityData?.custom_claims || null,
              null,
              2,
            ),
          );
          console.log('');

          console.log('🆔 === SUB IDENTIFIER CHECK ===');
          console.log('sub in identity_data:', identityData?.sub);
          console.log('sub in user_metadata:', supabaseUser.user_metadata?.sub);
          console.log('identities[0].id:', supabaseUser.identities?.[0]?.id);
          console.log('email (hashed sub):', supabaseUser.email);
          console.log('');

          console.log('✅ === getEntreefederatieSub() RESULT ===');
          console.log('Extracted sub:', entreefederatieSub);
          console.log('');

          // Verify all sub values match
          const subValues = [
            identityData?.sub,
            supabaseUser.user_metadata?.sub,
            supabaseUser.identities?.[0]?.id,
            entreefederatieSub,
          ].filter(Boolean);

          if (subValues.length > 0) {
            const uniqueSubs = new Set(subValues);
            if (uniqueSubs.size === 1) {
              console.log('✅ All sub values match:', Array.from(uniqueSubs)[0]);
            } else {
              console.warn(
                '⚠️ Sub values differ:',
                Array.from(uniqueSubs),
              );
            }
          } else {
            console.log('⚠️ No sub values found');
          }
          console.log('');

          console.log('⚙️ === APP_METADATA ===');
          console.log(JSON.stringify(supabaseUser.app_metadata, null, 2));
          console.log('');

          console.log('📄 === FULL USER OBJECT ===');
          console.log(JSON.stringify(supabaseUser, null, 2));
          console.log('');

          console.log('✅ ===== INSPECTION COMPLETE =====');
        } catch (error) {
          console.error('[AuthContext] ❌ Error inspecting SAML:', error);
        }
      };

    return () => {
      delete (window as unknown as {debugAuth?: () => Promise<void>}).debugAuth;
      delete (window as unknown as {debugSAML?: () => Promise<void>}).debugSAML;
    };
  }, [user]);

  // Check if sign-in redirect is in progress (OAuth/SAML callback detected)
  const signInInProgress =
    isOAuthRedirectInProgress() || signInInFlightRef.current;

  // Memoize context value to prevent unnecessary re-renders and HMR issues
  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      error,
      isDevelopmentMode: isDevelopmentModeLocal,
      isSessionOnly: false,
      toggleDevelopmentMode,
      signInWithGoogle,
      signInWithEntreefederatie,
      logout,
      canEnableDevelopmentMode,
      signInInProgress,
      refreshCredits,
    }),
    [
      user,
      loading,
      error,
      isDevelopmentModeLocal,
      toggleDevelopmentMode,
      signInWithGoogle,
      signInWithEntreefederatie,
      logout,
      canEnableDevelopmentMode,
      signInInProgress,
      refreshCredits,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
