/**
 * Detects if the current page load is returning from an OAuth/SAML redirect.
 */
export const isOAuthRedirectInProgress = (): boolean => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const hash = url.hash;

  // Check for OAuth/SAML callback parameters
  const hasCode = searchParams.has("code");
  const hasError = searchParams.has("error");
  const hasAccessTokenInHash = hash.includes("access_token") || hash.includes("refresh_token");

  return hasCode || hasError || hasAccessTokenInHash;
};

/**
 * Cleans up OAuth/SAML redirect parameters from URL
 */
export const cleanOAuthRedirectFromUrl = (): void => {
  if (isOAuthRedirectInProgress()) {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};
