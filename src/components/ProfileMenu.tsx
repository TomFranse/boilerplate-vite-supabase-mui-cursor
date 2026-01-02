import React, { useState, useCallback } from "react";
import {
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuthContext } from "@store/contexts/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";

interface ProfileMenuProps {
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
}

/**
 * ProfileMenu component for displaying user account information and sign-in options.
 * Shows sign-in buttons when user is not logged in, and profile/logout when logged in.
 */
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  anchorEl: externalAnchorEl,
  onClose: externalOnClose,
}) => {
  const { user, signInWithGoogle, signInWithEntreefederatie, logout } = useAuthContext();
  const [internalAnchorEl, setInternalAnchorEl] = useState<HTMLElement | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  // Use external anchor if provided, otherwise use internal state
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

  const handleSignIn = useCallback(() => {
    // Capture click timestamp for user-activation timing diagnostics
    try {
      (window as unknown as { __authClickT0?: number }).__authClickT0 = performance.now();
    } catch {
      // Ignore
    }

    // Call sign-in first to keep user gesture context active
    void signInWithGoogle();
    // Close the menu afterwards to avoid losing focus/activation before popup
    handleClose();
  }, [signInWithGoogle, handleClose]);

  const handleSignInEntreefederatie = useCallback(() => {
    // Capture click timestamp for user-activation timing diagnostics
    try {
      (window as unknown as { __authClickT0?: number }).__authClickT0 = performance.now();
    } catch {
      // Ignore
    }

    // Call sign-in first to keep user gesture context active
    void signInWithEntreefederatie();
    // Close the menu afterwards to avoid losing focus/activation before popup
    handleClose();
  }, [signInWithEntreefederatie, handleClose]);

  const handleSignOut = useCallback(async () => {
    handleClose();
    await logout();
  }, [logout, handleClose]);

  const isLoggedIn = user !== null;
  const entreefederatieEnabled = true; // Can be made configurable later

  // If no external anchor, render the trigger button
  if (!externalAnchorEl) {
    return (
      <>
        <Tooltip title={isLoggedIn ? "Account" : "Sign in"}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {isLoggedIn && user.email ? user.email.charAt(0).toUpperCase() : <PersonIcon />}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 240,
                maxWidth: 280,
              },
            },
          }}
        >
          {isLoggedIn ? (
            <>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {user.email ? user.email.charAt(0).toUpperCase() : <PersonIcon />}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email || "User"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                  <LogoutIcon fontSize="small" />
                </Box>
                Sign Out
              </MenuItem>
            </>
          ) : (
            <>
              {supabaseConfigured ? (
                <>
                  <MenuItem onClick={handleSignIn}>
                    <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      <LoginIcon fontSize="small" />
                    </Box>
                    Sign In with Google
                  </MenuItem>
                  {entreefederatieEnabled && (
                    <MenuItem onClick={handleSignInEntreefederatie}>
                      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                        <LoginIcon fontSize="small" />
                      </Box>
                      Login met schoolaccount
                    </MenuItem>
                  )}
                </>
              ) : (
                <MenuItem disabled>
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <LoginIcon fontSize="small" />
                  </Box>
                  Supabase not configured
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      </>
    );
  }

  // External anchor mode - just render the menu
  return (
    <Menu
      id="profile-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            minWidth: 240,
            maxWidth: 280,
          },
        },
      }}
    >
      {isLoggedIn ? (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40 }}>
                {user.email ? user.email.charAt(0).toUpperCase() : <PersonIcon />}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email || "User"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
              <LogoutIcon fontSize="small" />
            </Box>
            Sign Out
          </MenuItem>
        </>
      ) : (
        <>
          {supabaseConfigured ? (
            <>
              <MenuItem onClick={handleSignIn}>
                <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                  <LoginIcon fontSize="small" />
                </Box>
                Sign In with Google
              </MenuItem>
              {entreefederatieEnabled && (
                <MenuItem onClick={handleSignInEntreefederatie}>
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    <LoginIcon fontSize="small" />
                  </Box>
                  Login met schoolaccount
                </MenuItem>
              )}
            </>
          ) : (
            <MenuItem disabled>
              <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                <LoginIcon fontSize="small" />
              </Box>
              Supabase not configured
            </MenuItem>
          )}
        </>
      )}
    </Menu>
  );
};
