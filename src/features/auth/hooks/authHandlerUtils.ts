import * as authService from "../services/authService";
import type { User, LoginCredentials, SignUpCredentials } from "../types/auth.types";

interface AuthHandlerState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const handleLogin = async (
  credentials: LoginCredentials,
  state: AuthHandlerState
): Promise<void> => {
  state.setLoading(true);
  state.setError(null);
  const { user: loggedInUser, error: loginError } = await authService.login(credentials);
  if (loginError) {
    state.setError(loginError.message);
    state.setUser(null);
  } else {
    state.setUser(loggedInUser);
  }
  state.setLoading(false);
};

export const handleSignUp = async (
  credentials: SignUpCredentials,
  state: AuthHandlerState
): Promise<void> => {
  state.setLoading(true);
  state.setError(null);
  const { user: signedUpUser, error: signUpError } = await authService.signUp(credentials);
  if (signUpError) {
    state.setError(signUpError.message);
    state.setUser(null);
  } else {
    state.setUser(signedUpUser);
  }
  state.setLoading(false);
};

export const handleLogout = async (state: AuthHandlerState): Promise<void> => {
  state.setLoading(true);
  state.setError(null);
  const { error: logoutError } = await authService.logout();
  if (logoutError) {
    state.setError(logoutError.message);
  } else {
    state.setUser(null);
  }
  state.setLoading(false);
};
