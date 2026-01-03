import { NavigateFunction } from "react-router-dom";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import * as authService from "@features/auth/services/authService";
import { getAndClearRedirectPath } from "@utils/redirectUtils";

export const checkSupabaseConfigured = (navigate: NavigateFunction): boolean => {
  if (!isSupabaseConfigured()) {
    void navigate("/", { replace: true });
    return false;
  }
  return true;
};

export const handleAuthError = (navigate: NavigateFunction): void => {
  void navigate("/", { replace: true });
};

export const handleCodeExchange = async (
  code: string,
  navigate: NavigateFunction
): Promise<void> => {
  try {
    const { error: exchangeError } = await authService.exchangeCodeForSession(code);

    if (exchangeError) {
      void navigate("/", { replace: true });
      return;
    }

    const redirectPath = getAndClearRedirectPath();
    void navigate(redirectPath || "/", { replace: true });
  } catch {
    void navigate("/", { replace: true });
  }
};

export const getRedirectPath = (): string => {
  const redirectPath = getAndClearRedirectPath();
  return redirectPath || "/";
};
