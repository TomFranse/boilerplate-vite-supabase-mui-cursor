import { getSupabase, isSupabaseConfigured } from "@shared/services/supabaseService";
import { getEntreefederatieDomain } from "@config/entreefederatie";
import type { User, LoginCredentials, SignUpCredentials } from "../types/auth.types";

export const login = async (
  credentials: LoginCredentials
): Promise<{ user: User | null; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      error: new Error(
        "Authentication requires Supabase to be configured. Please set up Supabase in the setup wizard."
      ),
    };
  }

  try {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error };
    }

    const user: User | null = data.user
      ? {
          id: data.user.id,
          email: data.user.email || "",
          created_at: data.user.created_at,
        }
      : null;

    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Login failed"),
    };
  }
};

export const signUp = async (
  credentials: SignUpCredentials
): Promise<{ user: User | null; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      error: new Error(
        "Authentication requires Supabase to be configured. Please set up Supabase in the setup wizard."
      ),
    };
  }

  try {
    const { data, error } = await getSupabase().auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error };
    }

    const user: User | null = data.user
      ? {
          id: data.user.id,
          email: data.user.email || "",
          created_at: data.user.created_at,
        }
      : null;

    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Sign up failed"),
    };
  }
};

export const logout = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: null }; // No-op when Supabase not configured
  }

  try {
    const { error } = await getSupabase().auth.signOut();
    return { error: error || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Logout failed"),
    };
  }
};

export const getCurrentUser = async (): Promise<{
  user: User | null;
  error: Error | null;
}> => {
  if (!isSupabaseConfigured()) {
    // Return no user when Supabase is not configured (no error)
    return { user: null, error: null };
  }

  try {
    const {
      data: { user: authUser },
      error,
    } = await getSupabase().auth.getUser();

    if (error) {
      return { user: null, error };
    }

    const user: User | null = authUser
      ? {
          id: authUser.id,
          email: authUser.email || "",
          created_at: authUser.created_at,
        }
      : null;

    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Get user failed"),
    };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        "Authentication requires Supabase to be configured. Please set up Supabase in the setup wizard."
      ),
    };
  }

  try {
    // Clean URL hash before OAuth to prevent double-hash issue
    // Redirect to callback page which will handle the code exchange
    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error: signInError } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (signInError) {
      return { error: signInError };
    }

    // Auth state change handler will update user
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Failed to sign in with Google"),
    };
  }
};

/**
 * Sign in with Entreefederatie SAML SSO
 */
export const signInWithEntreefederatie = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        "Authentication requires Supabase to be configured. Please set up Supabase in the setup wizard."
      ),
    };
  }

  try {
    // Redirect to callback page which will handle the code exchange
    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { data, error: ssoError } = await getSupabase().auth.signInWithSSO({
      domain: getEntreefederatieDomain(),
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (ssoError) {
      return { error: ssoError };
    }

    if (data?.url) {
      // Redirect to Entreefederatie SAML endpoint
      window.location.href = data.url;
      return { error: null };
    } else {
      return { error: new Error("No redirect URL returned from SAML SSO") };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Failed to sign in with Entreefederatie"),
    };
  }
};

/**
 * Sign in anonymously (for visitors who haven't logged in)
 */
export const signInAnonymously = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: null }; // No-op when Supabase not configured
  }

  try {
    const { error } = await getSupabase().auth.signInAnonymously();
    return { error: error || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Failed to sign in anonymously"),
    };
  }
};

/**
 * Exchange authorization code for session (used in OAuth/SAML callback)
 */
export const exchangeCodeForSession = async (code: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error("Supabase is not configured"),
    };
  }

  try {
    const { error } = await getSupabase().auth.exchangeCodeForSession(code);
    return { error: error || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Failed to exchange code for session"),
    };
  }
};
