import { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { Button } from "@common/Button";
import { Input } from "@common/Input";
import { useAuthContext } from "@store/contexts/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import type { SignUpCredentials } from "../types/auth.types";

export const SignUpForm = () => {
  const { signUp, loading, error } = useAuthContext();
  const resetRedirect = useAuthRedirect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const supabaseConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    resetRedirect();
    const credentials: SignUpCredentials = { email, password };
    await signUp(credentials);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Sign Up
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
        autoComplete="new-password"
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
        required
        fullWidth
        margin="normal"
        autoComplete="new-password"
        error={password !== confirmPassword && confirmPassword !== ""}
        helperText={
          password !== confirmPassword && confirmPassword !== "" ? "Passwords do not match" : ""
        }
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || password !== confirmPassword}
        sx={{ mt: 2 }}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </Box>
  );
};
