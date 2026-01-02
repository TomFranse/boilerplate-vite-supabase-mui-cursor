import React, {useEffect} from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {supabase} from '../config/supabase';
import {ChatContainer} from '../components/chat';
import {FilesPage} from '../pages/files';
import {MarkdownEditorPage} from '../pages/files/edit';
import {SettingsPage} from '../pages/settings';
import {UsersPage} from '../pages/users';
import {BillingPage} from '../pages/admin/billing';
import {RolesPage} from '../pages/admin/roles';
import {UsageEntriesPage} from '../pages/admin/usage';
import {ToolsPage} from '../pages/admin/tools';
import {AuthPopupTest} from '../pages/dev/AuthPopupTest';
import {AssistantsManager} from '../components/assistants/AssistantsManager';
import {useAuth} from '../shared/context/AuthContext';
import {AppLayout} from '../components/layouts/AppLayout/AppLayout';
import {AdminLayout} from '../components/layouts/AdminLayout/AdminLayout';
import {ErrorBoundary} from '../components/common/ErrorBoundary';

/**
 * SAML SSO Callback handler for Supabase SAML authentication (Entreefederatie).
 * Handles redirects from Supabase after SAML SSO authentication.
 * Supabase redirects to Site URL, so we check for SAML params and handle accordingly.
 * If no SAML params, redirects to chat normally.
 */
const SAMLCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleSAMLCallback = async () => {
      // Check for SAML error or code in URL params
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      const code = searchParams.get('code');

      // If we have SAML-related params, handle them
      if (error || code) {
        if (error) {
          console.error('[SAMLCallback] SAML error:', {
            error,
            errorCode,
            errorDescription,
          });
          // Redirect to chat with error (user will see error message)
          navigate('/chat', {replace: true});
          return;
        }

        if (code) {
          console.log('[SAMLCallback] Processing SAML auth code...');
          try {
            // Exchange code for session
            const {error: exchangeError, data: sessionData} =
              await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.error(
                '[SAMLCallback] Code exchange error:',
                exchangeError,
              );
              navigate('/chat', {replace: true});
              return;
            }

            // Check for duplicate Entreefederatie users and fix email mismatches
            if (sessionData?.user) {
              const userId = sessionData.user.id;
              const provider = sessionData.user.app_metadata?.provider || '';
              const isEntreefederatie =
                provider.startsWith('sso:') ||
                sessionData.user.email?.endsWith('@kennisnet.org');

              if (isEntreefederatie) {
                try {
                  console.log(
                    '[SAMLCallback] Checking for Entreefederatie user duplicates...',
                  );
                  const {data: checkResult, error: checkError} =
                    await supabase.rpc('check_and_fix_entreefederatie_email', {
                      user_id_param: userId,
                    });

                  if (checkError) {
                    console.warn(
                      '[SAMLCallback] Error checking for duplicates:',
                      checkError,
                    );
                  } else if (checkResult && checkResult.length > 0) {
                    const result = checkResult[0];
                    if (result.has_duplicate) {
                      console.warn(
                        '[SAMLCallback] ⚠️ Duplicate Entreefederatie user detected:',
                        result.message,
                      );
                      console.warn(
                        '[SAMLCallback] Existing user ID:',
                        result.existing_user_id,
                      );
                      // Note: The function already fixed the existing user's email
                      // The current session is for the new user, but next login will match correctly
                    } else if (result.fixed_email) {
                      console.log(
                        '[SAMLCallback] ✅ Fixed email mismatch:',
                        result.message,
                      );
                      // Refresh session to get updated user data
                      await supabase.auth.refreshSession();
                    }
                  }
                } catch (err) {
                  console.warn(
                    '[SAMLCallback] Exception checking for duplicates:',
                    err,
                  );
                  // Don't block login if check fails
                }
              }
            }

            // Success - redirect to chat
            console.log('[SAMLCallback] SAML authentication successful');
            navigate('/chat', {replace: true});
            return;
          } catch (err) {
            console.error(
              '[SAMLCallback] Exception during code exchange:',
              err,
            );
            navigate('/chat', {replace: true});
            return;
          }
        }
      }

      // No SAML params - normal root route behavior
      navigate('/chat', {replace: true});
    };

    void handleSAMLCallback();
  }, [searchParams, navigate]);

  // Show loading while processing callback
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      Authenticating...
    </div>
  );
};

const ProtectedRoute: React.FC<{element: React.ReactElement}> = ({element}) => {
  const {isDevelopmentMode, loading} = useAuth();

  // Wait for auth to finish loading before making routing decisions
  // This prevents race conditions where devMode is cleared before user is loaded
  if (loading) {
    return null; // or a loading spinner if preferred
  }

  if (!isDevelopmentMode) {
    return <Navigate to="/chat" replace />;
  }

  return element;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Main App Routes */}
        <Route element={<AppLayout />}>
          {/* SAML SSO callback - check for SAML params on root route */}
          <Route path="/" element={<SAMLCallback />} />
          <Route path="/chat" element={<ChatContainer />} />
          <Route path="/chat/:conversationId" element={<ChatContainer />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/:fileId/edit" element={<MarkdownEditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/auth-test" element={<AuthPopupTest />} />
          <Route
            path="/assistants"
            element={<ProtectedRoute element={<AssistantsManager />} />}
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              element={
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              }
            />
          }
        >
          <Route
            path="users"
            element={
              <ErrorBoundary>
                <UsersPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="billing"
            element={
              <ErrorBoundary>
                <BillingPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="roles"
            element={
              <ErrorBoundary>
                <RolesPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="usage"
            element={
              <ErrorBoundary>
                <UsageEntriesPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="tools"
            element={
              <ErrorBoundary>
                <ToolsPage />
              </ErrorBoundary>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
