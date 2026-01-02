import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import * as authService from "@features/auth/services/authService";
import { getAndClearRedirectPath } from "@utils/redirectUtils";

/**
 * AuthCallbackPage handles OAuth/SAML redirects from Supabase.
 * This page processes the authorization code and exchanges it for a session.
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!isSupabaseConfigured()) {
        void navigate("/", { replace: true });
        return;
      }

      // Check for error parameters
      const error = searchParams.get("error");
      const code = searchParams.get("code");

      if (error) {
        // Redirect to home - error will be shown by auth context
        void navigate("/", { replace: true });
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } = await authService.exchangeCodeForSession(code);

          if (exchangeError) {
            void navigate("/", { replace: true });
            return;
          }

          // Success - redirect to stored path or home
          const redirectPath = getAndClearRedirectPath();
          void navigate(redirectPath || "/", { replace: true });
          return;
        } catch {
          void navigate("/", { replace: true });
          return;
        }
      }

      // No auth params - redirect to home
      void navigate("/", { replace: true });
    };

    void handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1">Authenticating...</Typography>
    </Box>
  );
};
