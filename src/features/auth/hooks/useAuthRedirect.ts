import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext";
import { getAndClearRedirectPath } from "@utils/redirectUtils";

/**
 * Custom hook that handles redirecting users to their intended page after successful authentication.
 * Watches for successful login/signup and redirects to the stored path (or home if none).
 *
 * @returns A function to reset the redirect flag (useful for form submissions)
 */
export const useAuthRedirect = (): (() => void) => {
  const navigate = useNavigate();
  const { user, loading, error } = useAuthContext();
  const hasRedirectedRef = useRef(false);

  // Redirect after successful authentication
  useEffect(() => {
    if (user && !loading && !error && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const redirectPath = getAndClearRedirectPath();
      void navigate(redirectPath || "/", { replace: true });
    }
  }, [user, loading, error, navigate]);

  // Reset redirect flag when user logs out or error occurs
  useEffect(() => {
    if (!user || error) {
      hasRedirectedRef.current = false;
    }
  }, [user, error]);

  // Return function to manually reset redirect flag (useful before form submission)
  return () => {
    hasRedirectedRef.current = false;
  };
};
