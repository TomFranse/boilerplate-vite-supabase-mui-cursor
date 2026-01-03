import { useState } from "react";
import { Box, Button } from "@mui/material";
import { SetupCard } from "../components/SetupCard";
import { SetupDialog } from "../components/SetupDialog";
import { ConnectionTestResult } from "../components/ConnectionTestResult";
import { EnvVariablesDisplay } from "../components/EnvVariablesDisplay";
import { SupabaseFormFields } from "../components/SupabaseFormFields";
import { SupabaseDescription } from "../components/SupabaseDescription";
import { useConnectionTest } from "../hooks/useConnectionTest";
import { useEnvWriter } from "../hooks/useEnvWriter";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { testSupabaseConnection } from "@shared/services/supabaseService";
import { updateSetupSectionStatus, getSetupSectionsState } from "@utils/setupUtils";
import type { SetupStatus } from "@utils/setupUtils";

interface SupabaseSectionProps {
  onStatusChange?: () => void;
}

export const SupabaseCard = ({ onStatusChange }: SupabaseSectionProps) => {
  const state = getSetupSectionsState();
  const status: SetupStatus = isSupabaseConfigured() ? "completed" : state.supabase;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SetupCard
        title="Connect to Supabase"
        description="Enter your Supabase project credentials to enable authentication and cloud database features. This step is required before setting up database tables."
        status={status}
        onClick={() => setDialogOpen(true)}
      />
      <SupabaseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

interface SupabaseDialogProps {
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const SupabaseDialog = ({ open, onClose, onStatusChange }: SupabaseDialogProps) => {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");

  const testConnection = useConnectionTest({
    onTest: async () => {
      if (!supabaseUrl || !supabaseKey) {
        return { success: false, error: "Please enter both URL and API key" };
      }
      return await testSupabaseConnection(supabaseUrl, supabaseKey);
    },
  });

  const envWriter = useEnvWriter({
    onError: (error) => {
      testConnection.setTestResult({ success: false, error });
    },
  });

  const handleSave = async () => {
    if (!testConnection.testResult?.success) {
      await testConnection.runTest();
      if (testConnection.testResult?.success) {
        await envWriter.writeEnv({
          VITE_SUPABASE_URL: supabaseUrl,
          VITE_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
        });
      }
      return;
    }

    if (!envWriter.envWritten) {
      await envWriter.writeEnv({
        VITE_SUPABASE_URL: supabaseUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
      });
      return;
    }

    updateSetupSectionStatus("supabase", "completed");
    onStatusChange?.();
  };

  const handleSkip = () => {
    updateSetupSectionStatus("supabase", "skipped");
    onStatusChange?.();
    onClose();
  };

  return (
    <SetupDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Connect to Supabase"
      saveButtonText={
        testConnection.testResult?.success && envWriter.envWritten ? "Save" : "Test & Save"
      }
      saveButtonDisabled={
        !supabaseUrl || !supabaseKey || testConnection.testing || envWriter.writingEnv
      }
    >
      <Box>
        <SupabaseDescription />

        <SupabaseFormFields
          url={supabaseUrl}
          key={supabaseKey}
          onUrlChange={setSupabaseUrl}
          onKeyChange={setSupabaseKey}
        />

        <ConnectionTestResult
          result={testConnection.testResult}
          envWritten={envWriter.envWritten}
          writingEnv={envWriter.writingEnv}
        />

        {testConnection.testResult?.success && envWriter.envWritten && (
          <EnvVariablesDisplay
            variables={[
              { name: "VITE_SUPABASE_URL", value: supabaseUrl },
              { name: "VITE_SUPABASE_PUBLISHABLE_KEY", value: supabaseKey },
            ]}
            description={"These values have been written to your .env file:"}
            showRestartWarning={true}
          />
        )}

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleSkip} color="inherit">
            Skip Supabase Setup
          </Button>
        </Box>
      </Box>
    </SetupDialog>
  );
};
