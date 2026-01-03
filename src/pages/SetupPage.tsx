import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { migrateOldSetupState, getEnabledFeatures } from "@utils/setupUtils";
import { SupabaseCard } from "./setup/sections/SupabaseSection";
import { AirtableCard } from "./setup/sections/AirtableSection";
import { HostingCard } from "./setup/sections/HostingSection";
import { ThemeCard } from "./setup/sections/ThemeSection";

export const SetupPage = () => {
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Migrate old state on mount
  useEffect(() => {
    migrateOldSetupState();
  }, []);

  const handleStatusChange = () => {
    // Status change handler for setup cards
    // No state tracking needed since we removed the progress bar
  };

  const handleFinishSetup = async () => {
    setFinishing(true);
    try {
      // Mark setup as complete
      localStorage.setItem("setup_complete", "true");

      // Call cleanup script endpoint
      const response = await fetch("/api/finish-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabledFeatures: getEnabledFeatures(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to finish setup");
      }

      // Reload page to apply changes
      window.location.reload();
    } catch {
      alert("Failed to finish setup. Please try again.");
      setFinishing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure your app components. All sections are optional - configure what you need and
          skip the rest.
        </Typography>
      </Box>

      {/* Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(auto-fit, minmax(280px, 1fr))",
            md: "repeat(auto-fit, minmax(320px, 1fr))",
            lg: "repeat(auto-fit, minmax(350px, 1fr))",
          },
          gap: 3,
          mb: 4,
          justifyContent: "center",
        }}
      >
        <SupabaseCard onStatusChange={handleStatusChange} />
        <AirtableCard onStatusChange={handleStatusChange} />
        <HostingCard onStatusChange={handleStatusChange} />
        <ThemeCard onStatusChange={handleStatusChange} />
      </Box>

      {/* Finish Setup Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setFinishDialogOpen(true)}
          startIcon={<CheckCircle />}
        >
          Finish Setup
        </Button>
      </Box>

      {/* Finish Setup Confirmation Dialog */}
      <Dialog open={finishDialogOpen} onClose={() => !finishing && setFinishDialogOpen(false)}>
        <DialogTitle>Finish Setup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to finish setup? This action is <strong>irreversible</strong> and
            will:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 2, pl: 3 }}>
            <li>
              <DialogContentText component="span">
                Delete all setup code (SetupPage, setupUtils, cleanup scripts)
              </DialogContentText>
            </li>
            <li>
              <DialogContentText component="span">
                Delete all code for features that were <strong>not enabled</strong>
              </DialogContentText>
            </li>
            <li>
              <DialogContentText component="span">
                Update App.tsx and other files to remove unused imports and routes
              </DialogContentText>
            </li>
          </Box>
          <Box sx={{ mt: 2, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
            <DialogContentText>
              <strong>Enabled features:</strong> {getEnabledFeatures().join(", ") || "None"}
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishDialogOpen(false)} disabled={finishing}>
            Cancel
          </Button>
          <Button
            onClick={handleFinishSetup}
            variant="contained"
            color="error"
            disabled={finishing}
          >
            {finishing ? "Finishing..." : "Finish Setup"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
