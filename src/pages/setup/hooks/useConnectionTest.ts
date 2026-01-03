import { useState } from "react";

interface ConnectionTestResult {
  success: boolean;
  error?: string;
}

interface UseConnectionTestOptions {
  onTest: () => Promise<ConnectionTestResult>;
  onSuccess?: () => void;
}

export const useConnectionTest = ({ onTest, onSuccess }: UseConnectionTestOptions) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await onTest();
      setTestResult(result);
      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  return {
    testing,
    testResult,
    runTest,
    setTestResult,
  };
};
