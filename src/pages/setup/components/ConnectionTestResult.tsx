import { Alert, Typography } from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

interface ConnectionTestResultProps {
  result: { success: boolean; error?: string } | null;
  envWritten?: boolean;
  writingEnv?: boolean;
  successMessage?: string;
}

export const ConnectionTestResult = ({
  result,
  envWritten = false,
  writingEnv = false,
  successMessage,
}: ConnectionTestResultProps) => {
  if (!result) {
    return null;
  }

  if (result.success) {
    const message =
      successMessage ||
      (envWritten
        ? "Connection successful and environment variables saved!"
        : writingEnv
          ? "Writing environment variables..."
          : "Connection successful! Writing environment variables...");

    return (
      <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
        {message}
      </Alert>
    );
  }

  return (
    <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
      <Typography variant="body2">Connection failed: {result.error || "Unknown error"}</Typography>
    </Alert>
  );
};
