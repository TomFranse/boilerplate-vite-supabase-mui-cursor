import { Link } from "react-router-dom";
import { Box, Typography, Button, Container, Alert } from "@mui/material";
import { useAuthContext } from "@store/contexts/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";

export const HomePage = () => {
  const { user } = useAuthContext();
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Vite MUI Supabase Starter
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          A modern boilerplate with React, TypeScript, Vite, Material-UI, and Supabase
        </Typography>
        {!supabaseConfigured && (
          <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
            <Typography variant="body2">
              <strong>Local Mode:</strong> You're running the app without Supabase configured.{" "}
              <Typography
                component={Link}
                to="/setup"
                sx={{ color: "primary.main", textDecoration: "underline" }}
              >
                Configure Supabase
              </Typography>{" "}
              to enable authentication.
            </Typography>
          </Alert>
        )}
        {user ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" paragraph>
              Welcome back, {user.email}!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            {supabaseConfigured ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{ mr: 2 }}
                >
                  Login
                </Button>
                <Button variant="outlined" size="large" component={Link} to="/signup">
                  Sign Up
                </Button>
              </>
            ) : (
              <Button variant="contained" size="large" component={Link} to="/setup">
                Configure Supabase
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};
