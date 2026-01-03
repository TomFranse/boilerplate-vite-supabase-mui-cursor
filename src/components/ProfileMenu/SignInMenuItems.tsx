import { MenuItem, Box } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

interface SignInMenuItemsProps {
  onSignInWithGoogle: () => void;
  onSignInWithEntreefederatie: () => void;
  entreefederatieEnabled: boolean;
}

export const SignInMenuItems = ({
  onSignInWithGoogle,
  onSignInWithEntreefederatie,
  entreefederatieEnabled,
}: SignInMenuItemsProps) => {
  return (
    <>
      <MenuItem key="sign-in-google" onClick={onSignInWithGoogle}>
        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
          <LoginIcon fontSize="small" />
        </Box>
        Sign In with Google
      </MenuItem>
      {entreefederatieEnabled && (
        <MenuItem key="sign-in-entreefederatie" onClick={onSignInWithEntreefederatie}>
          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
            <LoginIcon fontSize="small" />
          </Box>
          Login met schoolaccount
        </MenuItem>
      )}
    </>
  );
};
