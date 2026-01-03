import React from "react";
import { Menu } from "@mui/material";
import { useAuthContext } from "@store/contexts/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { useUserProfile } from "@features/auth/hooks/useUserProfile";
import { ProfileMenuContent } from "./ProfileMenu/ProfileMenuContent";
import { ProfileMenuTrigger } from "./ProfileMenu/ProfileMenuTrigger";
import { getMenuProps } from "@features/auth/utils/menuConfig";
import { useProfileMenuHandlers } from "@features/auth/hooks/useProfileMenuHandlers";
import { useProfileMenuState } from "@features/auth/hooks/useProfileMenuState";

interface ProfileMenuProps {
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
}

/**
 * ProfileMenu component for displaying user account information and sign-in options.
 * Shows sign-in buttons when user is not logged in, and profile/logout when logged in.
 */
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  anchorEl: externalAnchorEl,
  onClose: externalOnClose,
}) => {
  const { user } = useAuthContext();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const supabaseConfigured = isSupabaseConfigured();

  const { anchorEl, open, handleClick, handleClose } = useProfileMenuState({
    externalAnchorEl,
    externalOnClose,
  });

  const { handleSignIn, handleSignInEntreefederatie, handleSignOut } = useProfileMenuHandlers({
    onClose: handleClose,
  });

  const menuContent = (
    <ProfileMenuContent
      isLoggedIn={user !== null}
      supabaseConfigured={supabaseConfigured}
      user={user}
      profile={profile}
      profileLoading={profileLoading}
      onSignInWithGoogle={handleSignIn}
      onSignInWithEntreefederatie={handleSignInEntreefederatie}
      onSignOut={handleSignOut}
      entreefederatieEnabled={true}
    />
  );

  const menuProps = getMenuProps(anchorEl, open, handleClose);

  if (!externalAnchorEl) {
    return (
      <>
        <ProfileMenuTrigger user={user} profile={profile} onClick={handleClick} open={open} />
        <Menu {...menuProps}>{menuContent}</Menu>
      </>
    );
  }

  return <Menu {...menuProps}>{menuContent}</Menu>;
};
