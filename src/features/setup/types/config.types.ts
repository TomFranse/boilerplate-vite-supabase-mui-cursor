/**
 * Configuration file structure for app.config.json
 * This file stores the current state of app configuration for Cursor agent to read
 *
 * Note: Types are defined inline to avoid importing from non-types files
 * (architecture rule: types files should only import from other types files)
 */

/** Setup section identifiers (must match setupUtils.ts) */
export type ConfigSetupSectionId = "supabase" | "airtable" | "hosting" | "theme";

/** Setup section status values (must match setupUtils.ts) */
export type ConfigSetupStatus = "not-started" | "in-progress" | "completed" | "skipped";

export interface SupabaseConfiguration {
  configured: boolean;
  url?: string;
  keyLocation: ".env";
}

export interface AirtableConfiguration {
  configured: boolean;
  baseId?: string;
  tableId?: string;
  keyLocation: ".env";
}

export interface ThemeConfiguration {
  custom: boolean;
  hasCustomTheme: boolean;
}

export interface Configurations {
  supabase: SupabaseConfiguration;
  airtable: AirtableConfiguration;
  theme: ThemeConfiguration;
}

export interface SetupConfig {
  completed: boolean;
  sections: Record<ConfigSetupSectionId, ConfigSetupStatus>;
  enabledFeatures: ConfigSetupSectionId[];
}

export interface AppConfig {
  version: string;
  setup: SetupConfig;
  configurations: Configurations;
  lastUpdated: string;
}
