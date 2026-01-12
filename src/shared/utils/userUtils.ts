import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/features/auth/types/auth.types";

/**
 * Checks if a Supabase user is anonymous using the official is_anonymous property.
 * This is the recommended way to detect anonymous users according to Supabase documentation.
 *
 * @param supabaseUser - The Supabase user object (can be null)
 * @returns true if the user is anonymous, false otherwise
 */
export const isAnonymousUser = (supabaseUser: SupabaseUser | null): boolean => {
  if (!supabaseUser) return false;
  return supabaseUser.is_anonymous === true;
};

/**
 * Converts a Supabase user to our application's User interface.
 * Anonymous users are filtered out and return null (treated as not logged in).
 *
 * @param supabaseUser - The Supabase user object (can be null)
 * @returns User object if authenticated, null if anonymous or no user
 */
export const supabaseUserToUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;

  // Use official Supabase is_anonymous property
  if (isAnonymousUser(supabaseUser)) {
    return null; // Anonymous users are treated as not logged in
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    created_at: supabaseUser.created_at,
  };
};
