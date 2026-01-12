import { useState } from "react";
import { Box, Alert, Typography, Button } from "@mui/material";
import { SetupCard } from "../SetupCard";
import { SetupDialog } from "../SetupDialog";
import { ConnectionTestResult } from "../ConnectionTestResult";
import { EnvVariablesDisplay } from "../EnvVariablesDisplay";
import { AirtableFormFields } from "../AirtableFormFields";
import { AirtableDescription } from "../AirtableDescription";
import { useConnectionTest } from "../../hooks/useConnectionTest";
import { useAirtableSetup } from "../../hooks/useAirtableSetup";
import { updateSetupSectionStatus, getSetupSectionsState } from "@utils/setupUtils";
import type { SetupStatus } from "@utils/setupUtils";

interface AirtableSectionProps {
  onStatusChange?: () => void;
}

export const AirtableCard = ({ onStatusChange }: AirtableSectionProps) => {
  const { isConfigured } = useAirtableSetup();
  const state = getSetupSectionsState();
  const status: SetupStatus = isConfigured ? "completed" : state.airtable;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SetupCard
        title="Configure Airtable"
        description="Set up Airtable as an alternative data backend. Data-only; authentication still requires Supabase."
        status={status}
        onClick={() => setDialogOpen(true)}
      />
      <AirtableDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

interface AirtableDialogProps {
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const AirtableDialog = ({ open, onClose, onStatusChange }: AirtableDialogProps) => {
  const [airtableApiKey, setAirtableApiKey] = useState("");
  const [airtableBaseId, setAirtableBaseId] = useState("");
  const [airtableTableId, setAirtableTableId] = useState("");
  const { testAirtableConnection } = useAirtableSetup();

  const testConnection = useConnectionTest({
    onTest: async () => {
      if (!airtableApiKey || !airtableBaseId || !airtableTableId) {
        return { success: false, error: "Please enter API key, Base ID, and Table ID" };
      }
      return await testAirtableConnection(airtableApiKey, airtableBaseId, airtableTableId);
    },
  });

  const handleSave = async () => {
    if (!testConnection.testResult?.success) {
      await testConnection.runTest();
      return;
    }

    updateSetupSectionStatus("airtable", "completed");
    onStatusChange?.();
  };

  const handleSkip = () => {
    updateSetupSectionStatus("airtable", "skipped");
    onStatusChange?.();
    onClose();
  };

  return (
    <SetupDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Configure Airtable"
      saveButtonText={testConnection.testResult?.success ? "Save" : "Test & Save"}
      saveButtonDisabled={
        !airtableApiKey || !airtableBaseId || !airtableTableId || testConnection.testing
      }
    >
      <Box>
        <AirtableDescription />

        <AirtableFormFields
          apiKey={airtableApiKey}
          baseId={airtableBaseId}
          tableId={airtableTableId}
          onApiKeyChange={setAirtableApiKey}
          onBaseIdChange={setAirtableBaseId}
          onTableIdChange={setAirtableTableId}
        />

        <ConnectionTestResult
          result={testConnection.testResult}
          successMessage="Connection successful! Add the environment variables below to your .env file."
        />

        {testConnection.testResult?.success && (
          <EnvVariablesDisplay
            variables={[
              { name: "VITE_AIRTABLE_API_KEY", value: airtableApiKey },
              { name: "VITE_AIRTABLE_BASE_ID", value: airtableBaseId },
              { name: "VITE_AIRTABLE_TABLE_ID", value: airtableTableId },
            ]}
            title="Add to .env file"
            description="Copy these values to your .env file in the project root:"
          />
        )}

        {testConnection.testResult?.success && (
          <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> After adding these to your{" "}
              <Typography component="code" sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}>
                .env
              </Typography>{" "}
              file, restart your development server for the changes to take effect.
            </Typography>
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleSkip} color="inherit">
            Skip Airtable Setup
          </Button>
        </Box>
      </Box>
    </SetupDialog>
  );
};
