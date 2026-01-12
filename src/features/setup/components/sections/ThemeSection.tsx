import { useState, useEffect } from "react";
import { Box, TextField, Alert, Typography, Button } from "@mui/material";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { SetupCard } from "../SetupCard";
import { SetupDialog } from "../SetupDialog";
import {
  saveCustomTheme,
  validateThemeOptions,
  removeCustomTheme,
  getCustomTheme,
} from "@shared/theme/themeLoader";
import { defaultThemeOptions } from "@shared/theme/defaultTheme";
import { updateSetupSectionStatus, getSetupSectionsState } from "@utils/setupUtils";
import type { SetupStatus } from "@utils/setupUtils";

interface ThemeSectionProps {
  onStatusChange?: () => void;
}

export const ThemeCard = ({ onStatusChange }: ThemeSectionProps) => {
  const state = getSetupSectionsState();
  const status: SetupStatus = getCustomTheme() !== null ? "completed" : state.theme;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SetupCard
        title="Customize Theme"
        description="Customize your app's appearance with a custom MUI theme. Leave empty to use the default theme."
        status={status}
        onClick={() => setDialogOpen(true)}
      />
      <ThemeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

interface ThemeDialogProps {
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

interface ThemeDialogContentProps {
  themeJson: string;
  themeValidation: { valid: boolean; error?: string } | null;
  onThemeJsonChange: (value: string) => void;
  onValidate: () => void;
  onSkip: () => void;
}

const ThemeDialogContent = ({
  themeJson,
  themeValidation,
  onThemeJsonChange,
  onValidate,
  onSkip,
}: ThemeDialogContentProps) => {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
    >
      <Typography variant="body2" color="text.secondary" paragraph sx={{ flexShrink: 0 }}>
        You can customize your app's theme using the{" "}
        <Typography
          component="a"
          href="https://bareynol.github.io/mui-theme-creator/"
          target="_blank"
          rel="noopener"
          sx={{ color: "primary.main", textDecoration: "underline" }}
        >
          MUI Theme Creator
        </Typography>
        . Paste your theme JSON below to override the default theme.
      </Typography>

      <Alert severity="info" sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Leave this empty to use the default theme. You can always change
          this later.
        </Typography>
      </Alert>

      <TextField
        label="Theme JSON"
        value={themeJson}
        onChange={(e) => {
          const target = e.target as unknown as { value: string };
          onThemeJsonChange(target.value);
        }}
        fullWidth
        multiline
        margin="normal"
        placeholder='{"palette": {"mode": "dark", "primary": {"main": "#..."}}}'
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          "& .MuiInputBase-root": {
            flex: 1,
            minHeight: 0,
            alignItems: "flex-start",
          },
          "& .MuiInputBase-input": {
            fontFamily: "monospace",
            fontSize: "0.875rem",
            overflow: "auto !important",
            height: "100% !important",
            resize: "none",
          },
        }}
      />

      {themeValidation && (
        <Alert
          severity={themeValidation.valid ? "success" : "error"}
          icon={themeValidation.valid ? <CheckCircle /> : <ErrorIcon />}
          sx={{ mt: 2, flexShrink: 0 }}
        >
          {themeValidation.valid
            ? themeJson.trim()
              ? "Theme saved successfully! It will be applied after you reload the page."
              : "Default theme will be used."
            : `Invalid theme: ${themeValidation.error}`}
        </Alert>
      )}

      {themeJson.trim() && !themeValidation && (
        <Alert severity="warning" sx={{ mt: 2, flexShrink: 0 }}>
          <Typography variant="body2">
            Click "Validate Theme" to check your theme before saving, or leave empty to use the
            default theme.
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 2, flexShrink: 0 }}>
        <Button variant="outlined" onClick={onValidate}>
          Validate Theme
        </Button>
        <Button variant="outlined" onClick={onSkip} color="inherit">
          Skip Theme Customization
        </Button>
      </Box>
    </Box>
  );
};

const ThemeDialog = ({ open, onClose, onStatusChange }: ThemeDialogProps) => {
  const [themeJson, setThemeJson] = useState("");
  const [themeValidation, setThemeValidation] = useState<{ valid: boolean; error?: string } | null>(
    null
  );

  // Load existing custom theme if available, otherwise use default theme as starting point
  useEffect(() => {
    if (open) {
      const existingTheme = getCustomTheme();
      if (existingTheme) {
        setThemeJson(JSON.stringify(existingTheme, null, 2));
      } else {
        // Show default theme as starting point
        setThemeJson(JSON.stringify(defaultThemeOptions, null, 2));
      }
      setThemeValidation(null);
    }
  }, [open]);

  const handleThemeValidation = () => {
    if (!themeJson.trim()) {
      // Empty theme - remove custom theme to use default
      removeCustomTheme();
      setThemeValidation({ valid: true });
      return { valid: true };
    }

    const validation = validateThemeOptions(themeJson);
    setThemeValidation(validation);

    if (validation.valid && validation.theme) {
      saveCustomTheme(validation.theme);
    }

    return validation;
  };

  const handleSave = () => {
    const validation = handleThemeValidation();
    if (validation.valid || !themeJson.trim()) {
      updateSetupSectionStatus("theme", "completed");
      onStatusChange?.();
    }
  };

  const handleSkip = () => {
    updateSetupSectionStatus("theme", "skipped");
    onStatusChange?.();
    onClose();
  };

  const handleThemeJsonChange = (value: string) => {
    setThemeJson(value);
    setThemeValidation(null);
  };

  return (
    <SetupDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Customize Theme"
      saveButtonText="Save"
    >
      <ThemeDialogContent
        themeJson={themeJson}
        themeValidation={themeValidation}
        onThemeJsonChange={handleThemeJsonChange}
        onValidate={handleThemeValidation}
        onSkip={handleSkip}
      />
    </SetupDialog>
  );
};
