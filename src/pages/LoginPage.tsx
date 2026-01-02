import { Box, Container, Typography, Paper } from "@mui/material";
import { ProfileMenu } from "@components/ProfileMenu";
import { useState } from "react";
import { IconButton } from "@mui/material";
import { Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

/**
 * LoginPage displays the ProfileMenu for sign-in.
 * This matches the pattern from the main app where clicking the profile icon shows sign-in options.
 */
export const LoginPage = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Click the profile icon below to sign in with Google or your school account.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={handleClick}
            size="large"
            sx={{ width: 64, height: 64 }}
            aria-controls={anchorEl ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? "true" : undefined}
          >
            <Avatar sx={{ width: 64, height: 64 }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </IconButton>
        </Box>
        <ProfileMenu anchorEl={anchorEl} onClose={handleClose} />
      </Paper>
    </Container>
  );
};
