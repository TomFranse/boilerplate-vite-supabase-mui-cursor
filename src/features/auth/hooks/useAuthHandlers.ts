import { useRef } from "react";
import * as authService from "../services/authService";
import type { User, LoginCredentials, SignUpCredentials } from "../types/auth.types";
import {
  handleLogin as handleLoginUtil,
  handleSignUp as handleSignUpUtil,
  handleLogout as handleLogoutUtil,
} from "./authHandlerUtils";

interface UseAuthHandlersOptions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthHandlers = ({ setUser, setLoading, setError }: UseAuthHandlersOptions) => {
  const signInInFlightRef = useRef(false);

  const executeSignIn = async (
    signInMethod: () => Promise<{ error: Error | null }>,
    errorMessage: string
  ) => {
    if (signInInFlightRef.current) return;
    signInInFlightRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const { error: signInError } = await signInMethod();
      if (signInError) setError(signInError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
    } finally {
      setLoading(false);
      signInInFlightRef.current = false;
    }
  };

  const createSignInHandler = (
    signInMethod: () => Promise<{ error: Error | null }>,
    errorMessage: string
  ) => {
    return () => executeSignIn(signInMethod, errorMessage);
  };

  const state = { setUser, setLoading, setError };

  const handleLogin = (credentials: LoginCredentials) => handleLoginUtil(credentials, state);
  const handleSignUp = (credentials: SignUpCredentials) => handleSignUpUtil(credentials, state);
  const handleLogout = () => handleLogoutUtil(state);

  const handleSignInWithGoogle = createSignInHandler(
    authService.signInWithGoogle,
    "Failed to sign in with Google"
  );

  const handleSignInWithEntreefederatie = createSignInHandler(
    authService.signInWithEntreefederatie,
    "Failed to sign in with Entreefederatie"
  );

  return {
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEntreefederatie: handleSignInWithEntreefederatie,
  };
};
