import { Box, Container, Typography, Paper } from "@mui/material";
import { ProfileMenu } from "@components/ProfileMenu";

/**
 * LoginPage displays the ProfileMenu for sign-in.
 * This matches the pattern from the main app where clicking the profile icon shows sign-in options.
 */
export const LoginPage = () => {
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
          <ProfileMenu />
        </Box>
      </Paper>
    </Container>
  );
};
