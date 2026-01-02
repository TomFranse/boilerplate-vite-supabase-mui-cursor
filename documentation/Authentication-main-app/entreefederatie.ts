/**
 * Entreefederatie SAML Configuration
 *
 * Controls which Entreefederatie environment to use (staging vs production).
 *
 * IMPORTANT: The domain (`kennisnet.org`) stays the same for both environments.
 * Only the Supabase SAML provider metadata URL changes in Supabase Dashboard.
 *
 * To switch to production:
 * 1. Set `USE_PRODUCTION_ENTREEFEDERATIE = true` below
 * 2. Update Supabase Dashboard → Authentication → SSO → SAML Providers:
 *    - Find provider with domain `kennisnet.org`
 *    - Update Metadata URL to: `https://engine.entree.kennisnet.nl/authentication/idp/metadata`
 *
 * To rollback to staging:
 * 1. Set `USE_PRODUCTION_ENTREEFEDERATIE = false` below
 * 2. Update Supabase Dashboard → Authentication → SSO → SAML Providers:
 *    - Find provider with domain `kennisnet.org`
 *    - Update Metadata URL to: `https://engine.entree-s.kennisnet.nl/authentication/idp/metadata`
 */

import {ENVIRONMENT} from '../shared/constants';

/**
 * Manual override: Set to `true` to force production, `false` to force staging.
 * Set to `null` to use automatic detection (staging for localhost, production otherwise).
 */
const MANUAL_OVERRIDE: boolean | null = null;

/**
 * Whether to use production Entreefederatie.
 *
 * Logic:
 * - If MANUAL_OVERRIDE is set (not null), use that value
 * - Otherwise, use staging for localhost, production for deployed environments
 */
export const USE_PRODUCTION_ENTREEFEDERATIE: boolean =
  MANUAL_OVERRIDE !== null ? MANUAL_OVERRIDE : !ENVIRONMENT.isLocalhost();

/**
 * Gets the Entreefederatie SAML domain.
 *
 * Note: The domain is the same for both staging and production.
 * Only the Supabase SAML provider metadata URL differs.
 */
export const getEntreefederatieDomain = (): string => {
  return 'kennisnet.org';
};

/**
 * Gets the Entreefederatie IdP metadata URL for the current environment.
 *
 * This is for reference/documentation only.
 * The actual configuration is done in Supabase Dashboard.
 *
 * @returns The metadata URL that should be configured in Supabase
 */
export const getEntreefederatieMetadataUrl = (): string => {
  return USE_PRODUCTION_ENTREEFEDERATIE
    ? 'https://engine.entree.kennisnet.nl/authentication/idp/metadata' // Production
    : 'https://engine.entree-s.kennisnet.nl/authentication/idp/metadata'; // Staging
};

/**
 * Gets a human-readable description of the current Entreefederatie environment.
 * Useful for logging and debugging.
 */
export const getEntreefederatieEnvironment = (): string => {
  return USE_PRODUCTION_ENTREEFEDERATIE ? 'production' : 'staging';
};
