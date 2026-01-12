/**
 * MUI Theme Configuration
 *
 * This file contains ALL app styling, colors, typography, and component overrides.
 * It is the single source of truth for visual design in the application.
 *
 * Structure:
 * - palette: All color definitions (primary, secondary, background, text, etc.)
 * - typography: Font families, sizes, weights for all text elements
 * - components: MUI component style overrides
 *
 * Principles:
 * - Use palette references instead of hardcoded colors where possible
 * - All component styling should be defined here, not in individual components
 * - Use sx prop in components only for layout/spacing, not colors/styling
 */

import { createTheme, ThemeOptions, Theme } from "@mui/material/styles";

// Color constants - define once, reference everywhere
const COLORS = {
  primary: "#CF13B3",
  secondary: "#E6196B",
  background: {
    default: "#070614",
    paper: "#1C1B29",
  },
  text: {
    primary: "#ffffff",
    secondary: "#F5F5F7",
  },
  gradient: {
    start: "#8D0BD1",
    end: "#CF13B3",
  },
} as const;

export const defaultThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.secondary,
    },
    background: {
      default: COLORS.background.default,
      paper: COLORS.background.paper,
    },
    text: {
      primary: COLORS.text.primary,
      secondary: COLORS.text.secondary,
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    h1: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    // Use MUI's built-in body2 variant for code text (0.875rem)
    // Keep Montserrat for consistency across the app
    body2: {
      fontSize: "0.875rem",
    },
    // Use MUI's built-in caption variant for small text
    // Customize fontSize to 0.65rem for small chips
    caption: {
      fontSize: "0.65rem",
    },
  },
  components: {
    // AppBar styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "background.paper",
          color: "text.primary",
        },
      },
    },
    // Toolbar styling
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    // Link styling - handles all anchor tags and Link components
    MuiLink: {
      styleOverrides: {
        root: {
          color: "text.primary",
          textDecoration: "none",
          "&:hover": {
            color: "primary.main",
            textDecoration: "none",
          },
        },
      },
    },
    // Button styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          height: 48,
          padding: "8px 24px",
        },
        contained: {
          background: `linear-gradient(45deg, ${COLORS.gradient.start} 0%, ${COLORS.primary} 30%, ${COLORS.gradient.start} 60%, ${COLORS.primary} 90%, ${COLORS.gradient.start} 100%)`,
          backgroundSize: "200% 200%",
          backgroundPosition: "0% 50%",
          border: 0,
          boxShadow: "0 3px 5px 2px rgba(0, 0, 0, 0.4)",
          color: COLORS.text.primary,
          transition: "background-position 0.6s ease",
          "&:hover": {
            backgroundPosition: "100% 50%",
          },
          "&:active": {
            boxShadow: "0 2px 4px 1px rgba(0, 0, 0, 0.5)",
          },
        },
        text: {
          color: COLORS.text.primary,
          "&.MuiButton-colorPrimary": {
            color: COLORS.primary,
            "&:hover": {
              backgroundColor: "rgba(207, 19, 179, 0.1)",
            },
          },
          "&.MuiButton-colorSecondary": {
            color: COLORS.secondary,
            "&:hover": {
              backgroundColor: "rgba(230, 25, 107, 0.1)",
            },
          },
          "&.MuiButton-colorInherit": {
            color: "inherit",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          },
        },
        outlined: {
          borderColor: COLORS.text.primary,
          color: COLORS.text.primary,
          "&.MuiButton-colorPrimary": {
            borderColor: COLORS.primary,
            color: COLORS.primary,
            "&:hover": {
              borderColor: COLORS.primary,
              backgroundColor: "rgba(207, 19, 179, 0.1)",
            },
          },
          "&.MuiButton-colorSecondary": {
            borderColor: COLORS.secondary,
            color: COLORS.secondary,
            "&:hover": {
              borderColor: COLORS.secondary,
              backgroundColor: "rgba(230, 25, 107, 0.1)",
            },
          },
          "&.MuiButton-colorInherit": {
            borderColor: "currentColor",
            color: "inherit",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          },
        },
      },
    },
    // CssBaseline customization - handles global styles
    MuiCssBaseline: {
      styleOverrides: {
        code: ({ theme }: { theme: Theme }) => ({
          fontFamily: theme.typography.fontFamily, // Use Montserrat for consistency
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }),
        pre: ({ theme }: { theme: Theme }) => ({
          fontFamily: theme.typography.fontFamily, // Use Montserrat for consistency
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }),
        "*": {
          boxSizing: "border-box",
        },
        body: {
          margin: 0,
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    // Typography component styling - handles code elements via component="code"
    MuiTypography: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          "& code": {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            padding: "2px 4px",
            borderRadius: 1,
            fontSize: theme.typography.body2.fontSize,
            fontFamily: theme.typography.fontFamily, // Use Montserrat for consistency
          },
        }),
      },
    },
    // Chip component styling - small chips with custom height
    MuiChip: {
      styleOverrides: {
        sizeSmall: ({ theme }: { theme: Theme }) => ({
          height: 20, // Fixed height for small chips
          fontSize: theme.typography.caption.fontSize,
        }),
      },
    },
  },
};

export const defaultTheme = createTheme(defaultThemeOptions);
