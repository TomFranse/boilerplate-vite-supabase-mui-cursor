import { IconButton, Tooltip, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { User } from "@features/auth/types/auth.types";
import type { UserProfile } from "@features/auth/hooks/useUserProfile";
import { getAvatarInitial, getAvatarUrl } from "@/shared/utils/profileHelpers";

interface ProfileMenuTriggerProps {
  user: User | null;
  profile: UserProfile | null;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  open: boolean;
}

export const ProfileMenuTrigger = ({ user, profile, onClick, open }: ProfileMenuTriggerProps) => {
  const isLoggedIn = user !== null;
  const avatarInitial = getAvatarInitial(user, profile);
  const avatarUrl = getAvatarUrl(profile);

  return (
    <Tooltip title={isLoggedIn ? "Account" : "Sign in"}>
      <IconButton
        onClick={onClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Avatar
          src={isLoggedIn ? avatarUrl || undefined : undefined}
          sx={{ width: (theme) => theme.spacing(4), height: (theme) => theme.spacing(4) }}
        >
          {isLoggedIn && avatarInitial ? avatarInitial : <PersonIcon />}
        </Avatar>
      </IconButton>
    </Tooltip>
  );
};
