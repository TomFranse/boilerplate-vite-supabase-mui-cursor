/**
 * Service for writing environment variables to .env file
 *
 * This service calls the dev-only API endpoint provided by vite-plugin-dev-api
 * to write VITE_ prefixed environment variables to the .env file.
 *
 * Security: Only works in development mode (Vite dev server)
 *
 * Note: Config file sync is NOT done here because env vars require a server
 * restart before they're available. Config sync happens when setup section
 * status changes (which captures the state after restart).
 */

export interface WriteEnvResponse {
  success: boolean;
  message?: string;
  written?: string[];
  error?: string;
}

/**
 * Write environment variables to .env file
 *
 * @param variables - Record of environment variables (only VITE_ prefixed will be written)
 * @returns Promise resolving to the API response
 */
export const writeEnvVariables = async (
  variables: Record<string, string>
): Promise<WriteEnvResponse> => {
  try {
    const response = await fetch("/api/write-env", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message,
        written: data.written,
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to write environment variables",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to write environment variables",
    };
  }
};
