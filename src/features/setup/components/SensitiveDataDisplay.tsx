import { Box, Typography, Chip } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface SensitiveDataDisplayProps {
  label: string;
  isSet: boolean;
  keyName: string;
  helpText?: string;
}

/**
 * Component to display sensitive data (API keys, passwords, etc.)
 * Shows masked value (●●●●●●●●) with status indicator
 */
export const SensitiveDataDisplay = ({
  label,
  isSet,
  keyName,
  helpText,
}: SensitiveDataDisplayProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.default",
          px: 2,
          py: 1,
          borderRadius: 1,
          border: "1px solid",
          borderColor: (theme) =>
            isSet ? (theme.palette.mode === "dark" ? "success.dark" : "success.main") : "divider",
        }}
      >
        <Typography
          component="code"
          sx={{
            flex: 1,
            fontSize: (theme) => theme.typography.body2.fontSize,
            color: isSet ? "text.primary" : "text.disabled",
          }}
        >
          ●●●●●●●●
        </Typography>
        <Chip
          size="small"
          icon={isSet ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
          label={isSet ? "Set" : "Not Set"}
          color={isSet ? "success" : "default"}
          variant="outlined"
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
        <strong>{keyName}</strong>
        {helpText && ` - ${helpText}`}
      </Typography>
    </Box>
  );
};
