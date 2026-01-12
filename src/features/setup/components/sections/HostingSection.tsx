import { useState } from "react";
import { Box, Alert, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { SetupCard } from "../SetupCard";
import { SetupDialog } from "../SetupDialog";
import { ConfigurationViewDialog } from "../ConfigurationViewDialog";
import { HostingConfigView } from "../views/HostingConfigView";
import { useConfigurationReset } from "../../hooks/useConfigurationReset";
import { updateSetupSectionStatus, getSetupSectionsState } from "@utils/setupUtils";
import type { SetupStatus } from "@utils/setupUtils";

interface HostingSectionProps {
  onStatusChange?: () => void;
}

export const HostingCard = ({ onStatusChange }: HostingSectionProps) => {
  const state = getSetupSectionsState();
  const status: SetupStatus = state.hosting;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleCardClick = () => {
    if (status === "completed") {
      setViewDialogOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <SetupCard
        title="Configure Hosting"
        description="Learn how to configure environment variables on your hosting provider for production deployment."
        status={status}
        onClick={handleCardClick}
      />
      <HostingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={onStatusChange}
      />
      <HostingViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

interface HostingDialogProps {
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

interface HostingProvider {
  name: string;
  url: string;
  description: string;
}

const HOSTING_PROVIDERS: HostingProvider[] = [
  {
    name: "Vercel",
    url: "https://vercel.com/docs/concepts/projects/environment-variables",
    description: "Configure environment variables in Vercel dashboard",
  },
  {
    name: "Netlify",
    url: "https://docs.netlify.com/environment-variables/overview/",
    description: "Configure environment variables in Netlify dashboard",
  },
  {
    name: "Cloudflare Pages",
    url: "https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables",
    description: "Configure environment variables in Cloudflare dashboard",
  },
  {
    name: "Firebase Hosting",
    url: "https://firebase.google.com/docs/hosting/environment-variables",
    description: "Configure environment variables for Firebase Hosting",
  },
  {
    name: "GitHub Pages",
    url: "https://docs.github.com/en/actions/security-guides/encrypted-secrets",
    description: "Configure secrets in GitHub Actions",
  },
  {
    name: "AWS Amplify",
    url: "https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html",
    description: "Configure environment variables in AWS Amplify console",
  },
  {
    name: "Azure Static Web Apps",
    url: "https://learn.microsoft.com/en-us/azure/static-web-apps/application-settings",
    description: "Configure application settings in Azure Portal",
  },
];

const HostingDialog = ({ open, onClose, onStatusChange }: HostingDialogProps) => {
  const handleSave = () => {
    updateSetupSectionStatus("hosting", "completed");
    onStatusChange?.();
  };

  const handleSkip = () => {
    updateSetupSectionStatus("hosting", "skipped");
    onStatusChange?.();
    onClose();
  };

  return (
    <SetupDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Configure Frontend Hosting"
      saveButtonText="Mark as Complete"
    >
      <Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          For production deployment, you'll need to configure environment variables on your hosting
          provider. Select your hosting provider below to view their documentation:
        </Typography>

        <Box sx={{ mt: 3 }}>
          <List>
            {HOSTING_PROVIDERS.map((provider) => (
              <ListItem key={provider.name}>
                <ListItemText
                  primary={
                    <Typography
                      component="a"
                      href={provider.url}
                      target="_blank"
                      rel="noopener"
                      sx={{ color: "primary.main", textDecoration: "underline" }}
                    >
                      {provider.name}
                    </Typography>
                  }
                  secondary={provider.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Variables to configure:</strong> Add these environment variables on your hosting
            provider:
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1,
              fontSize: (theme) => theme.typography.body2.fontSize,
            }}
          >
            VITE_SUPABASE_URL=your-project-url{"\n"}
            VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
          </Box>
        </Alert>

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleSkip} color="inherit">
            Skip Hosting Setup
          </Button>
        </Box>
      </Box>
    </SetupDialog>
  );
};

interface HostingViewDialogProps {
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const HostingViewDialog = ({ open, onClose, onStatusChange }: HostingViewDialogProps) => {
  const { reset, resetting } = useConfigurationReset("hosting", () => {
    onStatusChange?.();
  });

  return (
    <ConfigurationViewDialog
      open={open}
      onClose={onClose}
      title="Hosting Configuration"
      sectionName="Hosting"
      onReset={reset}
      resetInProgress={resetting}
    >
      <HostingConfigView />
    </ConfigurationViewDialog>
  );
};
