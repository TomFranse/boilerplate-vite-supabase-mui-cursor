import { useCallback } from "react";
import { useAuthContext } from "@store/contexts/AuthContext";

interface UseProfileMenuHandlersProps {
  onClose: () => void;
}

export const useProfileMenuHandlers = ({ onClose }: UseProfileMenuHandlersProps) => {
  const { signInWithGoogle, signInWithEntreefederatie, logout } = useAuthContext();

  const handleSignIn = useCallback(() => {
    void signInWithGoogle();
    onClose();
  }, [signInWithGoogle, onClose]);

  const handleSignInEntreefederatie = useCallback(() => {
    void signInWithEntreefederatie();
    onClose();
  }, [signInWithEntreefederatie, onClose]);

  const handleSignOut = useCallback(async () => {
    onClose();
    await logout();
  }, [logout, onClose]);

  return {
    handleSignIn,
    handleSignInEntreefederatie,
    handleSignOut,
  };
};
