import { Outlet, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import { useAuthContext } from "@store/contexts/AuthContext";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { ProfileMenu } from "@components/ProfileMenu";

export const MainLayout = () => {
  const { user } = useAuthContext();
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Vite MUI Supabase Starter
            </Link>
          </Typography>
          {user && (
            <Button color="inherit" component={Link} to="/todos">
              Todos
            </Button>
          )}
          {!supabaseConfigured && (
            <Button color="inherit" component={Link} to="/setup">
              Setup
            </Button>
          )}
          <ProfileMenu />
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
