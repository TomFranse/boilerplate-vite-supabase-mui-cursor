import { useState } from "react";

interface UseEnvWriterOptions {
  onError?: (error: string) => void;
}

export const useEnvWriter = ({ onError }: UseEnvWriterOptions = {}) => {
  const [envWritten, setEnvWritten] = useState(false);
  const [writingEnv, setWritingEnv] = useState(false);

  const writeEnv = async (variables: Record<string, string>) => {
    setWritingEnv(true);
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
        setEnvWritten(true);
        return { success: true };
      } else {
        const error = data.message || "Failed to write environment variables";
        onError?.(error);
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to write environment variables";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setWritingEnv(false);
    }
  };

  return {
    envWritten,
    writingEnv,
    writeEnv,
  };
};
