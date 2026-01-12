import { getEnabledFeatures } from "@utils/setupUtils";
import { syncConfiguration } from "./configService";

/**
 * Service for setup-related API calls.
 * Follows architecture: pure functions, no React hooks.
 */
export const finishSetup = async (): Promise<void> => {
  // Mark setup as complete
  localStorage.setItem("setup_complete", "true");

  // Sync configuration BEFORE cleanup runs
  // This saves the user's configuration state before the cleanup script
  // removes setup files and unused feature code
  await syncConfiguration().catch(() => {
    // Silently fail - config sync is not critical for finish setup
  });

  // Call cleanup script endpoint
  const response = await fetch("/api/finish-setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      enabledFeatures: getEnabledFeatures(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to finish setup");
  }

  // Reload page to apply changes
  window.location.reload();
};
