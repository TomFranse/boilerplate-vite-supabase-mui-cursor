import { useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import type { User, LoginCredentials, SignUpCredentials } from "../types/auth.types";
import { initializeSession } from "./useAuthSession";
import { useAuthStateSubscription } from "./useAuthStateSubscription";
import { useAuthHandlers } from "./useAuthHandlers";

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

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleUserChange = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  const handleLoadingChange = useCallback((newLoading: boolean) => {
    setLoading(newLoading);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const { user: initialUser, error: initError } = await initializeSession();
      if (initError) {
        setError(initError);
      } else {
        setUser(initialUser);
      }
      setLoading(false);
    };

    void initAuth();
  }, []);

  useAuthStateSubscription({
    onUserChange: handleUserChange,
    onLoadingChange: handleLoadingChange,
  });

  const handlers = useAuthHandlers({
    setUser,
    setLoading,
    setError,
  });

  return {
    user,
    loading,
    error,
    ...handlers,
  };
};
