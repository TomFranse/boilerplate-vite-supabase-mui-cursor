import { Box, Avatar, Typography, CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { User } from "@features/auth/types/auth.types";
import type { UserProfile } from "@features/auth/hooks/useUserProfile";
import { getDisplayName, getAvatarInitial, getAvatarUrl } from "@/shared/utils/profileHelpers";
import { ProfileChips } from "./ProfileChips";
import { ProfileName } from "./ProfileName";
import { ProfileEmail } from "./ProfileEmail";

interface ProfileInfoProps {
  user: User | null;
  profile: UserProfile | null;
  profileLoading: boolean;
}

export const ProfileInfo = ({ user, profile, profileLoading }: ProfileInfoProps) => {
  const displayName = getDisplayName(user, profile);
  const avatarInitial = getAvatarInitial(user, profile);
  const avatarUrl = getAvatarUrl(profile);
  const showEmail = user?.email && user.email !== displayName;

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar src={avatarUrl || undefined} sx={{ width: 40, height: 40 }}>
          {avatarInitial || <PersonIcon />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ProfileName displayName={displayName} isVerified={profile?.email_verified ?? false} />
          {showEmail && <ProfileEmail email={user.email!} />}
          {profileLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <CircularProgress size={12} />
              <Typography variant="caption" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          )}
          {profile && <ProfileChips profile={profile} />}
        </Box>
      </Box>
    </Box>
  );
};
