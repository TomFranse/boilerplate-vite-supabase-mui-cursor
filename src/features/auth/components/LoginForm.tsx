import { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuthContext } from "@/shared/context/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import type { LoginCredentials } from "../types/auth.types";

export const LoginForm = () => {
  const { login, loading, error } = useAuthContext();
  const resetRedirect = useAuthRedirect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabaseConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetRedirect();
    const credentials: LoginCredentials = { email, password };
    await login(credentials);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Login
      </Typography>
      {!supabaseConfigured && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Authentication requires Supabase to be configured. Please set up
            Supabase in the{" "}
            <Typography
              component="a"
              href="/setup"
              sx={{ color: "primary.main", textDecoration: "underline" }}
            >
              setup wizard
            </Typography>
            .
          </Typography>
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
        fullWidth
        margin="normal"
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
        fullWidth
        margin="normal"
        autoComplete="current-password"
      />
      <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? "Logging in..." : "Login"}
      </Button>
    </Box>
  );
};
