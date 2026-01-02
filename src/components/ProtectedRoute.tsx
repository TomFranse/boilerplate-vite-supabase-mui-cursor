import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "@store/contexts/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { storeRedirectPath } from "@utils/redirectUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext();
  const supabaseConfigured = isSupabaseConfigured();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If Supabase is not configured, allow access without authentication
  if (!supabaseConfigured) {
    return <>{children}</>;
  }

  // If Supabase is configured, require authentication
  if (!user) {
    // Store the current path so we can redirect back after login
    storeRedirectPath(location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
