import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, useTheme } from "@mui/material";
import { AuthProvider } from "@store/contexts/AuthContext";
import { Topbar } from "@components/Topbar";
import { MainLayout } from "@layouts/MainLayout";
import { HomePage } from "@pages/HomePage";
import { SetupPage } from "@pages/SetupPage";
import { AuthCallbackPage } from "@pages/AuthCallbackPage";

function AppContent() {
  const theme = useTheme();

  return (
    <>
      <Topbar />
      <Box
        sx={{
          pt: `${theme.mixins.toolbar.minHeight}px`,
        }}
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
