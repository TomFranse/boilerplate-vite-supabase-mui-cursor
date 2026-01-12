import { useState } from "react";
import { finishSetup } from "../services/setupService";

/**
 * Hook for managing setup finish flow.
 * Handles dialog state and finish logic.
 */
export const useSetupFinish = () => {
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const handleOpenDialog = () => {
    setFinishDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!finishing) {
      setFinishDialogOpen(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await finishSetup();
      // finishSetup will reload the page, so we don't need to handle success here
    } catch {
      alert("Failed to finish setup. Please try again.");
      setFinishing(false);
    }
  };

  return {
    finishDialogOpen,
    finishing,
    handleOpenDialog,
    handleCloseDialog,
    handleFinish,
  };
};
