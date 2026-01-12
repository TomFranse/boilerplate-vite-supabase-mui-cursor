import { useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@shared/services/supabaseService";
import { handleAuthStateChange } from "./useAuthSession";
import { cleanOAuthRedirectFromUrl } from "@/shared/utils/oauthUtils";
import type { User } from "../types/auth.types";

interface UseAuthStateSubscriptionOptions {
  onUserChange: (user: User | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const useAuthStateSubscription = ({
  onUserChange,
  onLoadingChange,
}: UseAuthStateSubscriptionOptions) => {
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabase();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      cleanOAuthRedirectFromUrl();
      const { user: stateUser } = await handleAuthStateChange(session);
      onUserChange(stateUser);
      onLoadingChange(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onUserChange, onLoadingChange]);
};
