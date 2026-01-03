import { useState } from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

interface EnvVariable {
  name: string;
  value: string;
}

interface EnvVariablesDisplayProps {
  variables: EnvVariable[];
  title?: string;
  description?: string;
  showRestartWarning?: boolean;
}

export const EnvVariablesDisplay = ({
  variables,
  title = "Environment Variables",
  description,
  showRestartWarning = false,
}: EnvVariablesDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const envContent = variables.map((v) => `${v.name}=${v.value}`).join("\n");
    void navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variables.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      )}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              {variables.map((variable, index) => (
                <Typography
                  key={variable.name}
                  component="code"
                  sx={{
                    display: "block",
                    mb: index < variables.length - 1 ? 1 : 0,
                    bgcolor: "grey.200",
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {variable.name}={variable.value}
                </Typography>
              ))}
            </Box>
            <Button
              startIcon={<ContentCopy />}
              onClick={handleCopy}
              variant="outlined"
              size="small"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      {showRestartWarning && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Important:</strong> Environment variables have been written to your{" "}
            <Typography component="code" sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}>
              .env
            </Typography>{" "}
            file. Please <strong>restart your development server</strong> for the changes to take
            effect.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Stop the server (Ctrl+C) and run <code>pnpm dev</code> again.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
