/**
 * Utility functions for managing redirect paths in sessionStorage.
 * Used to redirect users back to their intended page after authentication.
 */

const REDIRECT_PATH_KEY = "auth_redirect_path";

/**
 * Stores the current path as the redirect target.
 * Should be called before redirecting to login.
 */
export const storeRedirectPath = (path: string): void => {
  try {
    sessionStorage.setItem(REDIRECT_PATH_KEY, path);
  } catch (error) {
    // Ignore errors (e.g., in private browsing mode)
    console.warn("Failed to store redirect path:", error);
  }
};

/**
 * Retrieves and removes the stored redirect path.
 * Returns null if no path is stored or if it's invalid.
 */
export const getAndClearRedirectPath = (): string | null => {
  try {
    const storedPath = sessionStorage.getItem(REDIRECT_PATH_KEY);
    if (storedPath) {
      sessionStorage.removeItem(REDIRECT_PATH_KEY);
      // Validate that it's a valid path (starts with / and doesn't include auth-related pages)
      if (
        storedPath.startsWith("/") &&
        !storedPath.startsWith("/login") &&
        !storedPath.startsWith("/auth") &&
        !storedPath.startsWith("/signup")
      ) {
        return storedPath;
      }
    }
    return null;
  } catch (error) {
    // Ignore errors
    console.warn("Failed to retrieve redirect path:", error);
    return null;
  }
};

/**
 * Clears the stored redirect path without retrieving it.
 */
export const clearRedirectPath = (): void => {
  try {
    sessionStorage.removeItem(REDIRECT_PATH_KEY);
  } catch (error) {
    // Ignore errors
    console.warn("Failed to clear redirect path:", error);
  }
};
