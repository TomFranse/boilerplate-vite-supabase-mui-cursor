import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

interface ResetConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sectionName: string;
  resetting?: boolean;
}

/**
 * Confirmation dialog for resetting configuration
 */
export const ResetConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  sectionName,
  resetting = false,
}: ResetConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Warning color="warning" />
        Reset {sectionName} Configuration?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will remove all {sectionName} configuration settings including environment variables.
          You will need to reconfigure {sectionName} from scratch.
        </DialogContentText>
        <DialogContentText sx={{ mt: 2, fontWeight: (theme) => theme.typography.fontWeightBold }}>
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={resetting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="warning" variant="contained" disabled={resetting}>
          {resetting ? "Resetting..." : "Reset Configuration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
