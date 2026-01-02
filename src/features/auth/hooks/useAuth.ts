import { useState, useEffect, useRef } from "react";
import { getSupabase, isSupabaseConfigured } from "@shared/services/supabaseService";
import * as authService from "../services/authService";
import type { User, LoginCredentials, SignUpCredentials } from "../types/auth.types";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEntreefederatie: () => Promise<void>;
}

/**
 * Detects if the current page load is returning from an OAuth/SAML redirect.
 */
const isOAuthRedirectInProgress = (): boolean => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const hash = url.hash;

  // Check for OAuth/SAML callback parameters
  const hasCode = searchParams.has("code");
  const hasError = searchParams.has("error");
  const hasAccessTokenInHash = hash.includes("access_token") || hash.includes("refresh_token");

  return hasCode || hasError || hasAccessTokenInHash;
};

/**
 * Converts Supabase user to our User interface
 */
const supabaseUserToUser = (
  supabaseUser: {
    id: string;
    email?: string | null;
    created_at?: string;
    app_metadata?: { provider?: string };
    identities?: Array<{ provider?: string }>;
  } | null
): User | null => {
  if (!supabaseUser) return null;

  // Check if this is an anonymous user
  const isAnonymous =
    supabaseUser.app_metadata?.provider === "anonymous" ||
    supabaseUser.identities?.some((id) => id.provider === "anonymous");

  // Anonymous users are treated as not logged in
  if (isAnonymous) {
    return null;
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    created_at: supabaseUser.created_at,
  };
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const signInInFlightRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const currentUser = supabaseUserToUser(session.user);
          setUser(currentUser);
        } else {
          // No session - check if we're returning from OAuth/SAML redirect
          const oauthRedirectInProgress = isOAuthRedirectInProgress();

          if (!oauthRedirectInProgress) {
            // Create anonymous session for visitors
            await authService.signInAnonymously();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    void initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const currentUser = supabaseUserToUser(session.user);

        // Clean up OAuth/SAML redirect parameters from URL
        if (isOAuthRedirectInProgress()) {
          const cleanUrl = `${window.location.origin}${window.location.pathname}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        setUser(currentUser);
        setLoading(false);
      } else {
        // User signed out - create anonymous session
        setUser(null);
        setLoading(true);
        try {
          await authService.signInAnonymously();
        } catch {
          // Ignore anonymous sign-in errors
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    const { user: loggedInUser, error: loginError } = await authService.login(credentials);
    if (loginError) {
      setError(loginError.message);
      setUser(null);
    } else {
      setUser(loggedInUser);
      // Redirect will be handled by the component that calls login (has Router context)
    }
    setLoading(false);
  };

  const handleSignUp = async (credentials: SignUpCredentials) => {
    setLoading(true);
    setError(null);
    const { user: signedUpUser, error: signUpError } = await authService.signUp(credentials);
    if (signUpError) {
      setError(signUpError.message);
      setUser(null);
    } else {
      setUser(signedUpUser);
      // Redirect will be handled by the component that calls signUp (has Router context)
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    const { error: logoutError } = await authService.logout();
    if (logoutError) {
      setError(logoutError.message);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    if (signInInFlightRef.current) {
      return;
    }
    signInInFlightRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const { error: signInError } = await authService.signInWithGoogle();
      if (signInError) {
        setError(signInError.message);
      }
      // Auth state change handler will update user
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
    } finally {
      setLoading(false);
      signInInFlightRef.current = false;
    }
  };

  const handleSignInWithEntreefederatie = async () => {
    if (signInInFlightRef.current) {
      return;
    }
    signInInFlightRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const { error: signInError } = await authService.signInWithEntreefederatie();
      if (signInError) {
        setError(signInError.message);
      }
      // Redirect will happen in authService
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Entreefederatie");
    } finally {
      setLoading(false);
      signInInFlightRef.current = false;
    }
  };

  return {
    user,
    loading,
    error,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEntreefederatie: handleSignInWithEntreefederatie,
  };
};
