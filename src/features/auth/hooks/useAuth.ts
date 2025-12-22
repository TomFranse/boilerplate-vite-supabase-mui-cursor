import { useState, useEffect } from "react";
import * as authService from "../services/authService";
import type { User, LoginCredentials, SignUpCredentials } from "../types/auth.types";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { user: currentUser, error: userError } = await authService.getCurrentUser();
      if (userError) {
        setError(userError.message);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };

    void initAuth();
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

  return {
    user,
    loading,
    error,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
  };
};
