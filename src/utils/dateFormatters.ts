/**
 * Utility functions for formatting dates
 */

/**
 * Formats a date to a readable string
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Time unit configuration for relative time formatting
 */
interface TimeUnit {
  minSeconds: number;
  maxSeconds: number;
  label: string;
  calculateDiff: (diffInSeconds: number) => number;
}

/**
 * Pluralize a word based on count
 */
const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

/**
 * Calculate time difference in seconds
 */
const calculateTimeDifference = (dateObj: Date): number => {
  const now = new Date();
  return Math.floor((now.getTime() - dateObj.getTime()) / 1000);
};

/**
 * Time units ordered from smallest to largest
 */
const TIME_UNITS: TimeUnit[] = [
  {
    minSeconds: 60,
    maxSeconds: 3600,
    label: "minute",
    calculateDiff: (diffInSeconds) => Math.floor(diffInSeconds / 60),
  },
  {
    minSeconds: 3600,
    maxSeconds: 86400,
    label: "hour",
    calculateDiff: (diffInSeconds) => Math.floor(diffInSeconds / 3600),
  },
  {
    minSeconds: 86400,
    maxSeconds: 604800,
    label: "day",
    calculateDiff: (diffInSeconds) => Math.floor(diffInSeconds / 86400),
  },
  {
    minSeconds: 604800,
    maxSeconds: 2592000,
    label: "week",
    calculateDiff: (diffInSeconds) => Math.floor(diffInSeconds / 604800),
  },
  {
    minSeconds: 2592000,
    maxSeconds: 31536000,
    label: "month",
    calculateDiff: (diffInSeconds) => Math.floor(diffInSeconds / 2592000),
  },
  {
    minSeconds: 31536000,
    maxSeconds: Infinity,
    label: "year",
    calculateDiff: (diffInSeconds) => Math.floor(diffInSeconds / 31536000),
  },
];

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param date - Date object or ISO string
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = calculateTimeDifference(dateObj);

  if (diffInSeconds < 60) {
    return "just now";
  }

  for (const unit of TIME_UNITS) {
    if (diffInSeconds >= unit.minSeconds && diffInSeconds < unit.maxSeconds) {
      const diff = unit.calculateDiff(diffInSeconds);
      return `${diff} ${pluralize(diff, unit.label, `${unit.label}s`)} ago`;
    }
  }

  // Fallback for years (should handle any edge cases)
  const diff = Math.floor(diffInSeconds / 31536000);
  return `${diff} ${pluralize(diff, "year", "years")} ago`;
}

/**
 * Formats a date to ISO string (YYYY-MM-DD)
 * @param date - Date object or ISO string
 * @returns ISO date string
 */
export function formatISODate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}

/**
 * Formats a date to a short string (MM/DD/YYYY)
 * @param date - Date object or ISO string
 * @returns Short date string
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
}
