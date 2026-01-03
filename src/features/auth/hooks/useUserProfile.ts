import { useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@shared/services/supabaseService";
import type { User } from "../types/auth.types";

const USER_PROFILE_FIELDS = `
  id,
  email,
  display_name,
  photo_url,
  email_verified,
  disabled,
  role,
  provider_ids,
  creation_time,
  last_sign_in_time,
  updated_at,
  remaining_credits,
  credit_period,
  auth_provider,
  ef_nl_edu_person_home_organization,
  ef_nl_edu_person_home_organization_id,
  total_messages,
  total_tokens,
  total_cost,
  settings
`;

const handleProfileFetchError = (
  fetchError: { code?: string; message: string },
  setProfile: (profile: UserProfile | null) => void,
  setError: (error: string | null) => void
) => {
  if (fetchError.code === "PGRST116") {
    setProfile(null);
    setError(null);
  } else {
    setError(fetchError.message);
    setProfile(null);
  }
};

export type UserRole = "anonymous" | "free" | "premium" | "admin" | "super-admin";

export interface UserProfile {
  id: string;
  email?: string | null;
  display_name?: string | null;
  photo_url?: string | null;
  email_verified?: boolean | null;
  disabled?: boolean | null;
  role?: UserRole | null;
  provider_ids?: string[] | null;
  creation_time?: string | null;
  last_sign_in_time?: string | null;
  updated_at?: string | null;
  remaining_credits?: number | null;
  credit_period?: string | null;
  auth_provider?: string | null;
  ef_nl_edu_person_home_organization?: string | null;
  ef_nl_edu_person_home_organization_id?: string | null;
  // Usage statistics
  total_messages?: number | null;
  total_tokens?: number | null;
  total_cost?: number | null;
  // Settings
  settings?: Record<string, unknown> | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch user profile data from the users table
 */
export const useUserProfile = (user: User | null): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from("users")
      .select(USER_PROFILE_FIELDS)
      .eq("id", user!.id)
      .single();

    if (fetchError) {
      handleProfileFetchError(fetchError, setProfile, setError);
    } else {
      setProfile(data as UserProfile);
    }
  };

  const handleFetchError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch user profile";
    setError(errorMessage);
    setProfile(null);
  };

  const fetchProfile = async () => {
    if (!user || !isSupabaseConfigured()) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fetchProfileData();
    } catch (err) {
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};
