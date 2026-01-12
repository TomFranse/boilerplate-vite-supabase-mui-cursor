/**
 * Service for managing app.config.json file
 *
 * This service syncs configuration state to app.config.json so Cursor agent
 * can read and understand the current app configuration.
 *
 * Security: API keys are NOT stored in this file - they remain in .env
 * This file only contains references and metadata.
 */

import type {
  AppConfig,
  Configurations,
  SetupConfig,
  ConfigSetupSectionId,
  ConfigSetupStatus,
} from "../types/config.types";
import { getSetupSectionsState, getEnabledFeatures, isSetupComplete } from "@utils/setupUtils";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { isAirtableConfigured } from "@shared/services/airtableService";
import { getCustomTheme } from "@shared/theme/themeLoader";

/**
 * Build current configuration state from app state
 */
const buildConfig = (): AppConfig => {
  const setupState = getSetupSectionsState();
  const enabledFeatures = getEnabledFeatures();
  const setupComplete = isSetupComplete();

  // Get Supabase URL from env (without key for security)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseConfigured = isSupabaseConfigured();

  // Get Airtable IDs from env (without key for security)
  const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const airtableTableId = import.meta.env.VITE_AIRTABLE_TABLE_ID;
  const airtableConfigured = isAirtableConfigured();

  // Check theme
  const customTheme = getCustomTheme();
  const hasCustomTheme = customTheme !== null;

  const configurations: Configurations = {
    supabase: {
      configured: supabaseConfigured,
      url: supabaseConfigured && supabaseUrl ? supabaseUrl : undefined,
      keyLocation: ".env",
    },
    airtable: {
      configured: airtableConfigured,
      baseId: airtableConfigured && airtableBaseId ? airtableBaseId : undefined,
      tableId: airtableConfigured && airtableTableId ? airtableTableId : undefined,
      keyLocation: ".env",
    },
    theme: {
      custom: hasCustomTheme,
      hasCustomTheme,
    },
  };

  const setup: SetupConfig = {
    completed: setupComplete,
    sections: {
      supabase: setupState.supabase as ConfigSetupStatus,
      airtable: setupState.airtable as ConfigSetupStatus,
      hosting: setupState.hosting as ConfigSetupStatus,
      theme: setupState.theme as ConfigSetupStatus,
    },
    enabledFeatures: enabledFeatures as ConfigSetupSectionId[],
  };

  return {
    version: "1.0.0",
    setup,
    configurations,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Write configuration to app.config.json via API endpoint
 *
 * @returns Promise resolving to success/error
 */
export const syncConfiguration = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const config = buildConfig();

    const response = await fetch("/api/write-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.message || "Failed to write configuration",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync configuration",
    };
  }
};
