import { Outlet } from "react-router-dom";
import { Container, Box } from "@mui/material";

export const MainLayout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* AppBar is handled by Topbar component (always visible) */}
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
