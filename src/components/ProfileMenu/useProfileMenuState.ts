import { useState, useCallback } from "react";

interface UseProfileMenuStateProps {
  externalAnchorEl?: HTMLElement | null;
  externalOnClose?: () => void;
}

export const useProfileMenuState = ({
  externalAnchorEl,
  externalOnClose,
}: UseProfileMenuStateProps) => {
  const [internalAnchorEl, setInternalAnchorEl] = useState<HTMLElement | null>(null);

  const anchorEl = externalAnchorEl ?? internalAnchorEl;
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!externalAnchorEl) {
      setInternalAnchorEl(event.currentTarget);
    }
  };

  const handleClose = useCallback(() => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalAnchorEl(null);
    }
  }, [externalOnClose]);

  return {
    anchorEl,
    open,
    handleClick,
    handleClose,
  };
};
