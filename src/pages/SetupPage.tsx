import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Card,
  CardContent,
  Link,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon, ContentCopy } from "@mui/icons-material";
import { isSupabaseConfigured, testSupabaseConnection } from "@shared/services/supabaseService";
import { testAirtableConnection } from "@shared/services/airtableService";
import {
  saveCustomTheme,
  validateThemeOptions,
  removeCustomTheme,
  getCustomTheme,
} from "@shared/theme/theme";
import { skipSupabaseSetup } from "@utils/setupUtils";

type SetupStep = "credentials" | "airtable" | "hosting" | "database" | "theme" | "complete";

export const SetupPage = () => {
  const [activeStep, setActiveStep] = useState<SetupStep>("credentials");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [airtableApiKey, setAirtableApiKey] = useState("");
  const [airtableBaseId, setAirtableBaseId] = useState("");
  const [airtableTableId, setAirtableTableId] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [airtableTestResult, setAirtableTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [themeJson, setThemeJson] = useState("");
  const [themeValidation, setThemeValidation] = useState<{ valid: boolean; error?: string } | null>(
    null
  );

  // Load existing custom theme if available
  useEffect(() => {
    const existingTheme = getCustomTheme();
    if (existingTheme) {
      setThemeJson(JSON.stringify(existingTheme, null, 2));
    }
  }, []);

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setTestResult({ success: false, error: "Please enter both URL and API key" });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      setActiveStep("airtable");
    }
  };

  const handleCopyEnv = () => {
    const envContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}`;
    void navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestAirtableConnection = async () => {
    if (!airtableApiKey || !airtableBaseId || !airtableTableId) {
      setAirtableTestResult({
        success: false,
        error: "Please enter API key, Base ID, and Table ID",
      });
      return;
    }

    setTesting(true);
    setAirtableTestResult(null);

    const result = await testAirtableConnection(airtableApiKey, airtableBaseId, airtableTableId);
    setAirtableTestResult(result);
    setTesting(false);
  };

  const handleCopyAirtableEnv = () => {
    const envContent = `VITE_AIRTABLE_API_KEY=${airtableApiKey}
VITE_AIRTABLE_BASE_ID=${airtableBaseId}
VITE_AIRTABLE_TABLE_ID=${airtableTableId}`;
    void navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleSaveTheme = () => {
    const validation = handleThemeValidation();
    if (validation.valid || !themeJson.trim()) {
      setActiveStep("complete");
    }
  };

  const handleFinishSetup = () => {
    // Mark setup as complete in localStorage
    localStorage.setItem("setup_complete", "true");
    // Reload to check if env vars are now available
    window.location.reload();
  };

  const steps = [
    { label: "Configure Supabase", step: "credentials" as SetupStep },
    { label: "Configure Airtable (Optional)", step: "airtable" as SetupStep },
    { label: "Set Up Database", step: "database" as SetupStep },
    { label: "Configure Hosting", step: "hosting" as SetupStep },
    { label: "Customize Theme", step: "theme" as SetupStep },
    { label: "Complete Setup", step: "complete" as SetupStep },
  ];

  const currentStepIndex = steps.findIndex((s) => s.step === activeStep);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Vite MUI Supabase Starter
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's get your app configured. This setup wizard will guide you through the process.
        </Typography>
      </Box>

      <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.step}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        {activeStep === "credentials" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Step 1: Configure Supabase Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You can configure Supabase to enable authentication and database features. If you
              don't have a Supabase project yet,{" "}
              <Link href="https://supabase.com" target="_blank" rel="noopener">
                create a free account
              </Link>
              . You can also skip this step and configure it later.
            </Typography>

            <Box sx={{ my: 3 }}>
              <TextField
                label="Supabase Project URL"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="https://your-project.supabase.co"
                helperText="Find this in your Supabase project settings under API"
              />
              <TextField
                label="Supabase Anon Key"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                fullWidth
                margin="normal"
                type="password"
                placeholder="your-anon-key"
                helperText="Find this in your Supabase project settings under API"
              />
            </Box>

            {testResult && (
              <Alert
                severity={testResult.success ? "success" : "error"}
                icon={testResult.success ? <CheckCircle /> : <ErrorIcon />}
                sx={{ mb: 2 }}
              >
                {testResult.success
                  ? "Connection successful! You can proceed to the next step."
                  : `Connection failed: ${testResult.error}`}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="contained" onClick={handleTestConnection} disabled={testing}>
                {testing ? "Testing..." : "Test Connection"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  skipSupabaseSetup();
                  setActiveStep("theme");
                }}
              >
                Skip Database Setup
              </Button>
            </Box>

            {testResult?.success && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Next: Add to .env file
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Copy these values to your{" "}
                  <Typography
                    component="code"
                    sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                  >
                    .env
                  </Typography>{" "}
                  file in the project root:
                </Typography>
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
                        <Typography
                          component="code"
                          sx={{
                            display: "block",
                            mb: 1,
                            bgcolor: "grey.200",
                            px: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          VITE_SUPABASE_URL={supabaseUrl}
                        </Typography>
                        <Typography
                          component="code"
                          sx={{ display: "block", bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                        >
                          VITE_SUPABASE_ANON_KEY={supabaseKey}
                        </Typography>
                      </Box>
                      <Button
                        startIcon={<ContentCopy />}
                        onClick={handleCopyEnv}
                        variant="outlined"
                        size="small"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> After adding these to your{" "}
                    <Typography
                      component="code"
                      sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                    >
                      .env
                    </Typography>{" "}
                    file, restart your development server for the changes to take effect.
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep("database")}
                  sx={{ mt: 2 }}
                >
                  I've added the .env file
                </Button>
              </Box>
            )}
          </Box>
        )}

        {activeStep === "airtable" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Step 2: Configure Airtable (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You can configure Airtable as an alternative data backend. Airtable is data-only;
              authentication still requires Supabase. If you don't have an Airtable account yet,{" "}
              <Link href="https://airtable.com" target="_blank" rel="noopener">
                create a free account
              </Link>
              . You can also skip this step and use Supabase or browser storage.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> To use Airtable, you'll need:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Personal Access Token (from Airtable account settings)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Base ID (found in your base's API documentation)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Table ID (the name of your table, e.g., 'Todos')" />
                </ListItem>
              </List>
            </Alert>

            <Box sx={{ my: 3 }}>
              <TextField
                label="Airtable API Key"
                value={airtableApiKey}
                onChange={(e) => setAirtableApiKey(e.target.value)}
                fullWidth
                margin="normal"
                type="password"
                placeholder="pat..."
                helperText="Personal Access Token from Airtable account settings"
              />
              <TextField
                label="Airtable Base ID"
                value={airtableBaseId}
                onChange={(e) => setAirtableBaseId(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="app..."
                helperText="Found in your base's API documentation"
              />
              <TextField
                label="Airtable Table ID"
                value={airtableTableId}
                onChange={(e) => setAirtableTableId(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Todos"
                helperText="The name of your table (e.g., 'Todos')"
              />
            </Box>

            {airtableTestResult && (
              <Alert
                severity={airtableTestResult.success ? "success" : "error"}
                icon={airtableTestResult.success ? <CheckCircle /> : <ErrorIcon />}
                sx={{ mb: 2 }}
              >
                {airtableTestResult.success
                  ? "Connection successful! You can proceed to the next step."
                  : `Connection failed: ${airtableTestResult.error}`}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="contained" onClick={handleTestAirtableConnection} disabled={testing}>
                {testing ? "Testing..." : "Test Connection"}
              </Button>
              <Button variant="outlined" onClick={() => setActiveStep("database")}>
                Skip Airtable Setup
              </Button>
            </Box>

            {airtableTestResult?.success && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Next: Add to .env file
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Copy these values to your{" "}
                  <Typography
                    component="code"
                    sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                  >
                    .env
                  </Typography>{" "}
                  file in the project root:
                </Typography>
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
                        <Typography
                          component="code"
                          sx={{
                            display: "block",
                            mb: 1,
                            bgcolor: "grey.200",
                            px: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          VITE_AIRTABLE_API_KEY={airtableApiKey}
                        </Typography>
                        <Typography
                          component="code"
                          sx={{
                            display: "block",
                            mb: 1,
                            bgcolor: "grey.200",
                            px: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          VITE_AIRTABLE_BASE_ID={airtableBaseId}
                        </Typography>
                        <Typography
                          component="code"
                          sx={{ display: "block", bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                        >
                          VITE_AIRTABLE_TABLE_ID={airtableTableId}
                        </Typography>
                      </Box>
                      <Button
                        startIcon={<ContentCopy />}
                        onClick={handleCopyAirtableEnv}
                        variant="outlined"
                        size="small"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> After adding these to your{" "}
                    <Typography
                      component="code"
                      sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                    >
                      .env
                    </Typography>{" "}
                    file, restart your development server for the changes to take effect.
                  </Typography>
                </Alert>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={() => setActiveStep("credentials")}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={() => setActiveStep("database")}>
                    I've added the .env file
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeStep === "database" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Step 2: Set Up Database Schema
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This boilerplate includes a todos feature that requires a database table. Run this SQL
              in your Supabase SQL Editor:
            </Typography>

            <Card variant="outlined" sx={{ my: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2">SQL Migration</Typography>
                  <Button
                    startIcon={<ContentCopy />}
                    onClick={() => {
                      const sql = `CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own todos
CREATE POLICY "Users can manage their own todos"
  ON todos
  FOR ALL
  USING (auth.uid() = user_id);`;
                      void navigator.clipboard.writeText(sql);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    variant="outlined"
                    size="small"
                  >
                    {copied ? "Copied!" : "Copy SQL"}
                  </Button>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    overflow: "auto",
                    fontSize: "0.875rem",
                  }}
                >
                  {`CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own todos
CREATE POLICY "Users can manage their own todos"
  ON todos
  FOR ALL
  USING (auth.uid() = user_id);`}
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>How to run this SQL:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="1. Go to your Supabase project dashboard"
                    secondary="Navigate to SQL Editor in the left sidebar"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="2. Create a new query"
                    secondary="Click 'New query' and paste the SQL above"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="3. Run the query"
                    secondary="Click 'Run' to execute the SQL"
                  />
                </ListItem>
              </List>
            </Alert>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep("airtable")}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setActiveStep("hosting")}>
                I've created the table
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === "hosting" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Step 3: Configure Frontend Hosting
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              For production deployment, you'll need to configure environment variables on your
              hosting provider. Select your hosting provider below to view their documentation:
            </Typography>

            <Box sx={{ mt: 3 }}>
              <List>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://vercel.com/docs/concepts/projects/environment-variables"
                        target="_blank"
                        rel="noopener"
                      >
                        Vercel
                      </Link>
                    }
                    secondary="Configure environment variables in Vercel dashboard"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://docs.netlify.com/environment-variables/overview/"
                        target="_blank"
                        rel="noopener"
                      >
                        Netlify
                      </Link>
                    }
                    secondary="Configure environment variables in Netlify dashboard"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables"
                        target="_blank"
                        rel="noopener"
                      >
                        Cloudflare Pages
                      </Link>
                    }
                    secondary="Configure environment variables in Cloudflare dashboard"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://firebase.google.com/docs/hosting/environment-variables"
                        target="_blank"
                        rel="noopener"
                      >
                        Firebase Hosting
                      </Link>
                    }
                    secondary="Configure environment variables for Firebase Hosting"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://docs.github.com/en/actions/security-guides/encrypted-secrets"
                        target="_blank"
                        rel="noopener"
                      >
                        GitHub Pages
                      </Link>
                    }
                    secondary="Configure secrets in GitHub Actions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html"
                        target="_blank"
                        rel="noopener"
                      >
                        AWS Amplify
                      </Link>
                    }
                    secondary="Configure environment variables in AWS Amplify console"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <Link
                        href="https://learn.microsoft.com/en-us/azure/static-web-apps/application-settings"
                        target="_blank"
                        rel="noopener"
                      >
                        Azure Static Web Apps
                      </Link>
                    }
                    secondary="Configure application settings in Azure Portal"
                  />
                </ListItem>
              </List>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Variables to configure:</strong> Add these two environment variables on your
                hosting provider:
              </Typography>
              <Box
                component="pre"
                sx={{ mt: 1, p: 1, bgcolor: "grey.100", borderRadius: 1, fontSize: "0.875rem" }}
              >
                VITE_SUPABASE_URL={supabaseUrl || "your-project-url"}
                VITE_SUPABASE_ANON_KEY={supabaseKey || "your-anon-key"}
              </Box>
            </Alert>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep("database")}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setActiveStep("theme")}>
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === "theme" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Step 4: Customize Theme (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You can customize your app's theme using the{" "}
              <Link
                href="https://bareynol.github.io/mui-theme-creator/"
                target="_blank"
                rel="noopener"
              >
                MUI Theme Creator
              </Link>
              . Paste your theme JSON below to override the default theme.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Leave this empty to use the default theme. You can always
                change this later.
              </Typography>
            </Alert>

            <TextField
              label="Theme JSON"
              value={themeJson}
              onChange={(e) => {
                setThemeJson(e.target.value);
                setThemeValidation(null);
              }}
              fullWidth
              multiline
              rows={12}
              margin="normal"
              placeholder='{"palette": {"mode": "dark", "primary": {"main": "#..."}}}'
              sx={{
                "& .MuiInputBase-root": {
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                },
              }}
            />

            {themeValidation && (
              <Alert
                severity={themeValidation.valid ? "success" : "error"}
                icon={themeValidation.valid ? <CheckCircle /> : <ErrorIcon />}
                sx={{ mt: 2 }}
              >
                {themeValidation.valid
                  ? themeJson.trim()
                    ? "Theme saved successfully! It will be applied after you reload the page."
                    : "Default theme will be used."
                  : `Invalid theme: ${themeValidation.error}`}
              </Alert>
            )}

            {themeJson.trim() && !themeValidation && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Click "Validate Theme" to check your theme before saving, or leave empty to use
                  the default theme.
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep("hosting")}>
                Back
              </Button>
              <Button variant="outlined" onClick={handleThemeValidation}>
                Validate Theme
              </Button>
              <Button variant="contained" onClick={handleSaveTheme}>
                {themeJson.trim() ? "Save & Continue" : "Skip"}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === "complete" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Step 5: Complete Setup
            </Typography>

            {isSupabaseConfigured() ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Great!</strong> Supabase is configured and ready to use.
                  </Typography>
                </Alert>

                <Typography variant="body1" paragraph>
                  Your boilerplate is now ready for development!
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Remove Setup Files
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Once you've verified everything works, you can remove the setup wizard files to
                  keep your repository clean.
                </Typography>

                <Card variant="outlined" sx={{ my: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Run this command in your terminal:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "grey.100",
                        p: 1.5,
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      <Typography
                        component="code"
                        sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                      >
                        pnpm cleanup-setup
                      </Typography>
                      <Button
                        startIcon={<ContentCopy />}
                        onClick={() => {
                          void navigator.clipboard.writeText("pnpm cleanup-setup");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        variant="outlined"
                        size="small"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">This will remove:</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="• SetupPage.tsx" secondary="The setup wizard page" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="• setupUtils.ts" secondary="Setup utility functions" />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="• cleanup-setup.js"
                        secondary="The cleanup script itself"
                      />
                    </ListItem>
                  </List>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    It will also update{" "}
                    <Typography
                      component="code"
                      sx={{ bgcolor: "grey.200", px: 0.5, borderRadius: 0.5 }}
                    >
                      App.tsx
                    </Typography>{" "}
                    to remove setup-related code.
                  </Typography>
                </Alert>

                <Button variant="contained" size="large" onClick={handleFinishSetup} sx={{ mt: 2 }}>
                  Mark Setup as Complete
                </Button>
              </Box>
            ) : (
              <Box>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Not configured yet.</strong> Please make sure:
                  </Typography>
                  <List dense sx={{ mt: 1 }}>
                    <ListItem>
                      <ListItemText primary="1. You've added the credentials to your .env file" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="2. You've restarted your development server" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="3. The .env file is in the project root directory" />
                    </ListItem>
                  </List>
                </Alert>

                <Button variant="outlined" onClick={() => setActiveStep("credentials")}>
                  Go Back to Configuration
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};
