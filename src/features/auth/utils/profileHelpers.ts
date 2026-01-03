import type { User } from "@features/auth/types/auth.types";
import type { UserProfile } from "@features/auth/hooks/useUserProfile";

/**
 * Get display name for user (profile display name, email, or fallback)
 */
export const getDisplayName = (user: User | null, profile: UserProfile | null): string => {
  if (profile?.display_name) return profile.display_name;
  if (user?.email) return user.email;
  return "User";
};

/**
 * Get avatar initial from display name or email
 */
export const getAvatarInitial = (user: User | null, profile: UserProfile | null): string | null => {
  if (profile?.display_name) {
    return profile.display_name.charAt(0).toUpperCase();
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return null;
};

/**
 * Get avatar URL from profile
 */
export const getAvatarUrl = (profile: UserProfile | null): string | null => {
  return profile?.photo_url || null;
};

/**
 * Get role display label
 */
export const getRoleDisplay = (profile: UserProfile | null): string | null => {
  if (!profile?.role || profile.role === "anonymous") return null;
  const roleLabels: Record<string, string> = {
    free: "Free",
    premium: "Premium",
    admin: "Admin",
    "super-admin": "Super Admin",
  };
  return roleLabels[profile.role] || profile.role;
};
