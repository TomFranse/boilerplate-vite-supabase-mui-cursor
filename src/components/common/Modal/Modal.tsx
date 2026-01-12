import {
  Dialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export interface ModalProps extends Omit<MuiDialogProps, "open"> {
  open: boolean;
  title?: string;
  actions?: React.ReactNode;
}

export const Modal = ({ open, title, children, actions, onClose, ...props }: ModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} {...props}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};
