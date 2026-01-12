import { useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { ContentCopy, CheckCircle } from "@mui/icons-material";

interface ConfigurationItemProps {
  label: string;
  value: string;
  canCopy?: boolean;
  helpText?: string;
}

/**
 * Component to display a single configuration item (key-value pair)
 * with optional copy functionality
 */
export const ConfigurationItem = ({
  label,
  value,
  canCopy = false,
  helpText,
}: ConfigurationItemProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          borderColor: "divider",
        }}
      >
        <Typography
          component="code"
          sx={{
            flex: 1,
            fontSize: (theme) => theme.typography.body2.fontSize,
            wordBreak: "break-all",
          }}
        >
          {value}
        </Typography>
        {canCopy && (
          <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
            <IconButton size="small" onClick={handleCopy} color={copied ? "success" : "default"}>
              {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {helpText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {helpText}
        </Typography>
      )}
    </Box>
  );
};
