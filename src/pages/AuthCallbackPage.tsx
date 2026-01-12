import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  checkSupabaseConfigured,
  handleAuthError,
  handleCodeExchange,
  getRedirectPath,
} from "@features/auth/services/authCallbackService";
import { getAuthCallbackParams } from "@/shared/utils/authCallbackParams";

/**
 * AuthCallbackPage handles OAuth/SAML redirects from Supabase.
 * This page processes the authorization code and exchanges it for a session.
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!checkSupabaseConfigured(navigate)) return;

      const { error, code } = getAuthCallbackParams(searchParams);

      if (error) {
        handleAuthError(navigate);
        return;
      }

      if (code) {
        await handleCodeExchange(code, navigate);
        return;
      }

      void navigate(getRedirectPath(), { replace: true });
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
