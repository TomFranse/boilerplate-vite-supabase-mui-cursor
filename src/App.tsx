import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@store/contexts/AuthContext";
import { MainLayout } from "@layouts/MainLayout";
import { AuthLayout } from "@layouts/AuthLayout";
import { HomePage } from "@pages/HomePage";
import { LoginPage } from "@pages/LoginPage";
import { SignUpPage } from "@pages/SignUpPage";
import { TodosPage } from "@pages/TodosPage";
import { SetupPage } from "@pages/SetupPage";
import { AuthCallbackPage } from "@pages/AuthCallbackPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { shouldShowSetup } from "./utils/setupUtils";

function App() {
  const showSetup = shouldShowSetup();

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {showSetup ? (
            <Route path="*" element={<SetupPage />} />
          ) : (
            <>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/todos"
                  element={
                    <ProtectedRoute>
                      <TodosPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
              </Route>
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
