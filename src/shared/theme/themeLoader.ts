import { createTheme, ThemeOptions } from "@mui/material/styles";
import { defaultThemeOptions } from "./defaultTheme";

const CUSTOM_THEME_STORAGE_KEY = "custom_mui_theme";

/**
 * Get custom theme from localStorage
 */
export const getCustomTheme = (): ThemeOptions | null => {
  try {
    const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ThemeOptions;
    }
  } catch (error) {
    // Silently fail and return null to use default theme
  }
  return null;
};

/**
 * Save custom theme to localStorage
 */
export const saveCustomTheme = (themeOptions: ThemeOptions): void => {
  try {
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(themeOptions));
  } catch (error) {
    // Silently fail - storage quota may be exceeded
  }
};

/**
 * Remove custom theme (revert to default)
 */
export const removeCustomTheme = (): void => {
  localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
};

/**
 * Load theme - custom theme if available, otherwise default
 */
export const loadTheme = () => {
  const customTheme = getCustomTheme();
  if (customTheme) {
    return createTheme(customTheme);
  }
  return createTheme(defaultThemeOptions);
};

/**
 * Validate theme options
 */
export const validateThemeOptions = (
  themeJson: string
): { valid: boolean; error?: string; theme?: ThemeOptions } => {
  try {
    const parsed = JSON.parse(themeJson);

    // Basic validation - check if it has palette or other theme properties
    if (typeof parsed !== "object" || parsed === null) {
      return { valid: false, error: "Theme must be a valid object" };
    }

    // Try to create theme to validate
    createTheme(parsed as ThemeOptions);

    return { valid: true, theme: parsed as ThemeOptions };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid theme JSON",
    };
  }
};
