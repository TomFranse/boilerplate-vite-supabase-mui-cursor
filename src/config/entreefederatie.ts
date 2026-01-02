/**
 * Entreefederatie SAML Configuration
 *
 * Returns the SAML domain used for Entreefederatie authentication.
 * The domain is configured in Supabase Dashboard → Authentication → SSO → SAML Providers.
 */

/**
 * Gets the Entreefederatie SAML domain.
 *
 * @returns The domain configured in Supabase (e.g., 'kennisnet.org')
 */
export const getEntreefederatieDomain = (): string => {
  return "kennisnet.org";
};
