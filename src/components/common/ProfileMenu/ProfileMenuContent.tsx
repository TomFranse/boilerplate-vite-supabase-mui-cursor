import { MenuItem, Box, Divider } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { ProfileInfo } from "./ProfileInfo";
import { SignInMenuItems } from "./SignInMenuItems";
import type { User } from "@features/auth/types/auth.types";
import type { UserProfile } from "@features/auth/hooks/useUserProfile";

interface ProfileMenuContentProps {
  isLoggedIn: boolean;
  supabaseConfigured: boolean;
  user: User | null;
  profile: UserProfile | null;
  profileLoading: boolean;
  onSignInWithGoogle: () => void;
  onSignInWithEntreefederatie: () => void;
  onSignOut: () => void;
  entreefederatieEnabled: boolean;
}

export const ProfileMenuContent = ({
  isLoggedIn,
  supabaseConfigured,
  user,
  profile,
  profileLoading,
  onSignInWithGoogle,
  onSignInWithEntreefederatie,
  onSignOut,
  entreefederatieEnabled,
}: ProfileMenuContentProps) => {
  if (isLoggedIn) {
    return (
      <>
        <ProfileInfo user={user} profile={profile} profileLoading={profileLoading} />
        <Divider key="divider" />
        <MenuItem key="sign-out" onClick={onSignOut}>
          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
            <LogoutIcon fontSize="small" />
          </Box>
          Sign Out
        </MenuItem>
      </>
    );
  }

  if (supabaseConfigured) {
    return (
      <SignInMenuItems
        onSignInWithGoogle={onSignInWithGoogle}
        onSignInWithEntreefederatie={onSignInWithEntreefederatie}
        entreefederatieEnabled={entreefederatieEnabled}
      />
    );
  }

  return (
    <MenuItem key="not-configured" disabled>
      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
        <LoginIcon fontSize="small" />
      </Box>
      Supabase not configured
    </MenuItem>
  );
};
