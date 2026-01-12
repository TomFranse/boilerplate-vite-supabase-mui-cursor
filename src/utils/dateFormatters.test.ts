import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatRelativeTime, formatDate, formatISODate, formatShortDate } from "./dateFormatters";

describe("dateFormatters", () => {
  beforeEach(() => {
    // Mock Date.now() to have consistent test results
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatRelativeTime", () => {
    it("should return 'just now' for dates less than 60 seconds ago", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);
      const date = new Date("2024-01-01T11:59:30Z");
      expect(formatRelativeTime(date)).toBe("just now");
    });

    it("should format minutes correctly", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneMinuteAgo = new Date("2024-01-01T11:59:00Z");
      expect(formatRelativeTime(oneMinuteAgo)).toBe("1 minute ago");

      const fiveMinutesAgo = new Date("2024-01-01T11:55:00Z");
      expect(formatRelativeTime(fiveMinutesAgo)).toBe("5 minutes ago");
    });

    it("should format hours correctly", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneHourAgo = new Date("2024-01-01T11:00:00Z");
      expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");

      const twoHoursAgo = new Date("2024-01-01T10:00:00Z");
      expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
    });

    it("should format days correctly", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneDayAgo = new Date("2023-12-31T12:00:00Z");
      expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");

      const threeDaysAgo = new Date("2023-12-29T12:00:00Z");
      expect(formatRelativeTime(threeDaysAgo)).toBe("3 days ago");
    });

    it("should format weeks correctly", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneWeekAgo = new Date("2023-12-25T12:00:00Z");
      expect(formatRelativeTime(oneWeekAgo)).toBe("1 week ago");

      const twoWeeksAgo = new Date("2023-12-18T12:00:00Z");
      expect(formatRelativeTime(twoWeeksAgo)).toBe("2 weeks ago");
    });

    it("should format months correctly", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneMonthAgo = new Date("2023-12-01T12:00:00Z");
      expect(formatRelativeTime(oneMonthAgo)).toBe("1 month ago");

      const sixMonthsAgo = new Date("2023-07-01T12:00:00Z");
      expect(formatRelativeTime(sixMonthsAgo)).toBe("6 months ago");
    });

    it("should format years correctly", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneYearAgo = new Date("2023-01-01T12:00:00Z");
      expect(formatRelativeTime(oneYearAgo)).toBe("1 year ago");

      const twoYearsAgo = new Date("2022-01-01T12:00:00Z");
      expect(formatRelativeTime(twoYearsAgo)).toBe("2 years ago");
    });

    it("should handle ISO string dates", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const oneHourAgo = "2024-01-01T11:00:00Z";
      expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
    });

    it("should handle edge case of exactly 60 seconds", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const exactlyOneMinuteAgo = new Date("2024-01-01T11:59:00Z");
      expect(formatRelativeTime(exactlyOneMinuteAgo)).toBe("1 minute ago");
    });

    it("should handle future dates gracefully", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const futureDate = new Date("2024-01-01T13:00:00Z");
      // Should still format, but will show negative time
      const result = formatRelativeTime(futureDate);
      expect(typeof result).toBe("string");
    });
  });

  describe("formatDate", () => {
    it("should format date with default options", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date);
      expect(result).toContain("January");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("should format date with custom options", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date, { year: "numeric", month: "short" });
      expect(result).toContain("Jan");
      expect(result).toContain("2024");
    });

    it("should handle ISO string dates", () => {
      const result = formatDate("2024-01-15T12:00:00Z");
      expect(result).toContain("January");
    });
  });

  describe("formatISODate", () => {
    it("should format date as ISO string", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      expect(formatISODate(date)).toBe("2024-01-15");
    });

    it("should handle ISO string dates", () => {
      expect(formatISODate("2024-01-15T12:00:00Z")).toBe("2024-01-15");
    });
  });

  describe("formatShortDate", () => {
    it("should format date as short string", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatShortDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should handle ISO string dates", () => {
      const result = formatShortDate("2024-01-15T12:00:00Z");
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
