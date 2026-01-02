import React, {useEffect, useState, useCallback} from 'react';
import {
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import type {User} from '../../../shared/context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import {AppIcon} from '../../common';
import {supabase} from '../../../config/supabase';
import {getDaysUntilReset} from '../../../shared/utils/creditSystem';
import {useCreditLimit} from '../../../shared/hooks/useCreditLimit';
import {getUserRole} from '../../../shared/utils/userRole';
import type {UserRole} from '../../../shared/types/admin.types';

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignInEntreefederatie?: () => void;
  onSignOut: () => void;
  onNavigateToSettings?: () => void;
  // Developer mode toggle
  isDevelopmentMode?: boolean;
  canEnableDevelopmentMode?: boolean;
  onToggleDevMode?: () => void;
}

/**
 * ProfileMenu component for displaying user account information and actions.
 * Matches the styling of other overflow menus in the TopBar.
 *
 * @param anchorEl - The element to anchor the menu to
 * @param open - Whether the menu is open
 * @param onClose - Callback when the menu should close
 * @param user - The current Firebase user or null if not logged in
 * @param onSignIn - Callback when user clicks sign in
 * @param onSignOut - Callback when user clicks sign out
 */
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  anchorEl,
  open,
  onClose,
  user,
  onSignIn,
  onSignInEntreefederatie,
  onSignOut,
  onNavigateToSettings,
  isDevelopmentMode = false,
  canEnableDevelopmentMode = false,
  onToggleDevMode,
}) => {
  const meta = import.meta as unknown as {env?: Record<string, string>};
  const appVersion = meta.env?.VITE_APP_VERSION || '5.1.11';
  // Entreefederatie sign-in option enabled - redirect URI configured
  const entreefederatieEnabled = true;

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [creditPeriod, setCreditPeriod] = useState<string | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  // Fetch user role and credit period
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setUserRole(null);
      setCreditPeriod(null);
      setRemainingCredits(null);
      return;
    }

    const fetchUserData = async () => {
      try {
        const {data, error} = await supabase
          .from('users')
          .select('role, credit_period')
          .eq('id', user.uid)
          .single();

        if (error) {
          console.error('[ProfileMenu] Failed to fetch user data:', error);
          return;
        }

        const role = getUserRole(user.email, data);
        setUserRole(role);
        setCreditPeriod(data.credit_period);
      } catch (err) {
        console.error('[ProfileMenu] Unexpected error:', err);
      }
    };

    void fetchUserData();
  }, [user]);

  // Fetch credit limit using hook (automatically handles loading/error states)
  const {
    creditLimit,
    isLoading: isLoadingLimit,
    error: limitError,
  } = useCreditLimit(userRole);

  // Fetch credits when menu opens (fresh data from database)
  const loadCredits = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoadingCredits(true);
    try {
      const {data, error} = await supabase
        .from('users')
        .select('remaining_credits')
        .eq('id', user.uid)
        .single();

      if (error) {
        console.error('[ProfileMenu] Failed to fetch credits:', error);
        // Fallback to user.remainingCredits if fetch fails
        setRemainingCredits(user?.remainingCredits ?? 0);
        return;
      }

      setRemainingCredits(data.remaining_credits ?? 0);
    } catch (err) {
      console.error('[ProfileMenu] Unexpected error loading credits:', err);
      setRemainingCredits(user?.remainingCredits ?? 0);
    } finally {
      setIsLoadingCredits(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user && !user.isAnonymous && user.uid) {
      void loadCredits();
    } else {
      setRemainingCredits(null);
      setIsLoadingCredits(false);
    }
  }, [open, user, loadCredits]);

  // Calculate credits display values
  // Use fetched credits if available, otherwise fallback to user.remainingCredits
  const displayCredits =
    remainingCredits !== null
      ? remainingCredits
      : (user?.remainingCredits ?? 0);
  // creditLimit is now fetched async in useEffect above
  const usedCredits = creditLimit - displayCredits;
  const percentageUsed =
    creditLimit > 0 ? (usedCredits / creditLimit) * 100 : 0;
  const percentageRemaining =
    creditLimit > 0 ? (displayCredits / creditLimit) * 100 : 0;
  const daysUntilReset = creditPeriod ? getDaysUntilReset(creditPeriod) : null;

  // Color coding for credits (based on percentage used)
  const getCreditsColor = () => {
    if (percentageUsed >= 80) return 'error.main';
    if (percentageUsed >= 50) return 'warning.main';
    return 'success.main';
  };
  const handleSignIn = () => {
    // Capture click timestamp for user-activation timing diagnostics
    try {
      (window as unknown as {__authClickT0?: number}).__authClickT0 =
        performance.now();
    } catch (e) {
      void 0;
    }

    // Call sign-in first to keep user gesture context active
    onSignIn();
    // Close the menu afterwards to avoid losing focus/activation before popup
    onClose();
  };

  const handleSignInEntreefederatie = () => {
    // Capture click timestamp for user-activation timing diagnostics
    try {
      (window as unknown as {__authClickT0?: number}).__authClickT0 =
        performance.now();
    } catch (e) {
      void 0;
    }

    // Call sign-in first to keep user gesture context active
    if (onSignInEntreefederatie) {
      onSignInEntreefederatie();
    }
    // Close the menu afterwards to avoid losing focus/activation before popup
    onClose();
  };

  const handleSignOut = () => {
    onClose();
    onSignOut();
  };

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  // Treat anonymous users as not logged in for UI purposes
  // Also check if user has email/displayName as fallback for anonymous detection
  // Note: Entreefederatie users may not have email (GDPR), so check displayName too
  const isLoggedIn =
    user && !user.isAnonymous && (user.email || user.displayName);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      transformOrigin={{vertical: 'top', horizontal: 'right'}}
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
      {isLoggedIn
        ? [
            <Box key="user-info" sx={{px: 2, py: 1.5}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <Avatar
                  src={user.photoURL || undefined}
                  alt={user.displayName || 'User'}
                  sx={{width: 40, height: 40}}
                >
                  {!user.photoURL && <PersonIcon />}
                </Avatar>
                <Box sx={{flex: 1, minWidth: 0}}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.displayName || 'User'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              {/* Credits Display */}
              {userRole && creditLimit > 0 && (
                <Box sx={{mt: 1.5}}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{fontSize: '0.7rem'}}
                    >
                      Credits
                    </Typography>
                    <Tooltip
                      title={
                        daysUntilReset !== null && daysUntilReset > 0
                          ? `Resets in ${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''}`
                          : 'Credits reset monthly'
                      }
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: isLoadingCredits
                            ? 'text.secondary'
                            : getCreditsColor(),
                        }}
                      >
                        {displayCredits.toLocaleString()} /{' '}
                        {creditLimit.toLocaleString()}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <LinearProgress
                    variant={isLoadingCredits ? 'indeterminate' : 'determinate'}
                    value={
                      isLoadingCredits
                        ? undefined
                        : Math.min(100, Math.max(0, percentageRemaining))
                    }
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: isLoadingCredits
                          ? 'primary.main'
                          : getCreditsColor(),
                      },
                    }}
                  />
                  {daysUntilReset !== null && daysUntilReset > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.65rem',
                        mt: 0.5,
                        display: 'block',
                      }}
                    >
                      Resets in {daysUntilReset} day
                      {daysUntilReset !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>,
            <Divider key="user-divider" />,
            ...(canEnableDevelopmentMode
              ? [
                  <MenuItem
                    key="dev-toggle"
                    onClick={() => handleAction(onToggleDevMode!)}
                    selected={isDevelopmentMode}
                  >
                    <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
                      <AppIcon faIcon="bug" size="small" />
                    </Box>
                    Developer Mode
                  </MenuItem>,
                  <Divider key="dev-divider" />,
                ]
              : []),

            <MenuItem
              key="settings"
              onClick={() => handleAction(onNavigateToSettings!)}
            >
              <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
                <SettingsIcon fontSize="small" />
              </Box>
              Settings
            </MenuItem>,
            <Divider key="settings-divider" />,

            <MenuItem key="sign-out" onClick={handleSignOut}>
              <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
                <LogoutIcon fontSize="small" />
              </Box>
              Sign Out
            </MenuItem>,
            <Divider key="version-divider" />,
            <Box
              key="version-display"
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{fontFamily: 'monospace'}}
              >
                {'v' + appVersion}
              </Typography>
            </Box>,
          ]
        : [
            <MenuItem key="sign-in-google" onClick={handleSignIn}>
              <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
                <LoginIcon fontSize="small" />
              </Box>
              Sign In with Google
            </MenuItem>,
            // Entreefederatie sign-in option enabled
            ...(onSignInEntreefederatie && entreefederatieEnabled
              ? [
                  <MenuItem
                    key="sign-in-entreefederatie"
                    onClick={handleSignInEntreefederatie}
                  >
                    <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
                      <LoginIcon fontSize="small" />
                    </Box>
                    Login met schoolaccount
                  </MenuItem>,
                ]
              : []),
            <Divider key="version-divider" />,
            <Box
              key="version-display"
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{fontFamily: 'monospace'}}
              >
                {'v' + appVersion}
              </Typography>
            </Box>,
          ]}
    </Menu>
  );
};
