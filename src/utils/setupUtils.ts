import { isSupabaseConfigured } from "@shared/services/supabaseService";
import { isAirtableConfigured } from "@shared/services/airtableService";
import { getCustomTheme } from "@shared/theme/themeLoader";

export type SetupSectionId = "supabase" | "airtable" | "hosting" | "theme";
export type SetupStatus = "not-started" | "in-progress" | "completed" | "skipped";

export interface SetupSectionsState {
  supabase: SetupStatus;
  airtable: SetupStatus;
  hosting: SetupStatus;
  theme: SetupStatus;
}

const SETUP_SECTIONS_STORAGE_KEY = "setup_sections_state";
const DEFAULT_STATE: SetupSectionsState = {
  supabase: "not-started",
  airtable: "not-started",
  hosting: "not-started",
  theme: "not-started",
};

/**
 * Get setup sections state from localStorage
 */
export const getSetupSectionsState = (): SetupSectionsState => {
  try {
    const stored = localStorage.getItem(SETUP_SECTIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SetupSectionsState;
    }
  } catch {
    // Silently fail and return default
  }
  return { ...DEFAULT_STATE };
};

/**
 * Update a specific section's status
 */
export const updateSetupSectionStatus = (sectionId: SetupSectionId, status: SetupStatus): void => {
  const currentState = getSetupSectionsState();
  const newState: SetupSectionsState = {
    ...currentState,
    [sectionId]: status,
  };
  try {
    localStorage.setItem(SETUP_SECTIONS_STORAGE_KEY, JSON.stringify(newState));
  } catch {
    // Silently fail - storage quota may be exceeded
  }
};

/**
 * Auto-detect completed sections from environment and localStorage
 */
const detectCompletedSections = (): Partial<SetupSectionsState> => {
  const detected: Partial<SetupSectionsState> = {};

  // Check Supabase
  if (isSupabaseConfigured()) {
    detected.supabase = "completed";
  }

  // Check Airtable
  if (isAirtableConfigured()) {
    detected.airtable = "completed";
  }

  // Check Theme
  if (getCustomTheme() !== null) {
    detected.theme = "completed";
  }

  return detected;
};

/**
 * Migrate old setup state flags to new structure
 */
export const migrateOldSetupState = (): void => {
  // Check if migration already happened
  if (localStorage.getItem("setup_sections_migrated") === "true") {
    return;
  }

  const currentState = getSetupSectionsState();
  const detected = detectCompletedSections();
  const migratedState: SetupSectionsState = { ...currentState };

  // Migrate from old flags
  const setupComplete = localStorage.getItem("setup_complete") === "true";
  const supabaseSkipped = localStorage.getItem("supabase_skipped") === "true";

  if (setupComplete) {
    // If old setup was complete, mark all detected sections as completed
    Object.keys(detected).forEach((key) => {
      const sectionId = key as SetupSectionId;
      if (detected[sectionId] === "completed") {
        migratedState[sectionId] = "completed";
      }
    });
  }

  if (supabaseSkipped && !isSupabaseConfigured()) {
    migratedState.supabase = "skipped";
  }

  // Apply detected states (override migrated states)
  Object.keys(detected).forEach((key) => {
    const sectionId = key as SetupSectionId;
    if (detected[sectionId]) {
      migratedState[sectionId] = detected[sectionId]!;
    }
  });

  // Save migrated state
  try {
    localStorage.setItem(SETUP_SECTIONS_STORAGE_KEY, JSON.stringify(migratedState));
    localStorage.setItem("setup_sections_migrated", "true");
  } catch {
    // Silently fail
  }
};

/**
 * Get which features were enabled (completed)
 */
export const getEnabledFeatures = (): SetupSectionId[] => {
  const state = getSetupSectionsState();
  return (Object.keys(state) as SetupSectionId[]).filter((key) => state[key] === "completed");
};

/**
 * Check if setup is marked as complete in localStorage (backward compatibility)
 */
export const isSetupComplete = (): boolean => {
  return localStorage.getItem("setup_complete") === "true";
};

/**
 * Check if Supabase setup was skipped (backward compatibility)
 */
export const isSupabaseSkipped = (): boolean => {
  const state = getSetupSectionsState();
  return state.supabase === "skipped";
};

/**
 * Mark Supabase setup as skipped (backward compatibility)
 */
export const skipSupabaseSetup = (): void => {
  updateSetupSectionStatus("supabase", "skipped");
};

/**
 * Check if setup wizard should be shown
 * Always returns false - allow app access anytime
 */
export const shouldShowSetup = (): boolean => {
  return false;
};
