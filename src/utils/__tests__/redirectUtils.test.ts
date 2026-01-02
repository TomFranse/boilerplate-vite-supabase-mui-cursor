import { describe, it, expect, beforeEach, vi } from "vitest";
import { storeRedirectPath, getAndClearRedirectPath, clearRedirectPath } from "../redirectUtils";

describe("redirectUtils", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    try {
      sessionStorage.removeItem("auth_redirect_path");
    } catch {
      // Ignore errors
    }
    // Clear console.warn mock
    vi.clearAllMocks();
  });

  describe("storeRedirectPath", () => {
    it("should store a valid path in sessionStorage", () => {
      storeRedirectPath("/todos");
      expect(sessionStorage.getItem("auth_redirect_path")).toBe("/todos");
    });

    it("should overwrite existing path", () => {
      storeRedirectPath("/todos");
      storeRedirectPath("/dashboard");
      expect(sessionStorage.getItem("auth_redirect_path")).toBe("/dashboard");
    });

    it("should handle errors gracefully (e.g., private browsing mode)", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock sessionStorage.setItem to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      // Should not throw
      expect(() => storeRedirectPath("/todos")).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalled();

      // Restore
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe("getAndClearRedirectPath", () => {
    it("should retrieve and remove a valid path", () => {
      sessionStorage.setItem("auth_redirect_path", "/todos");
      const path = getAndClearRedirectPath();

      expect(path).toBe("/todos");
      expect(sessionStorage.getItem("auth_redirect_path")).toBeNull();
    });

    it("should return null if no path is stored", () => {
      const path = getAndClearRedirectPath();
      expect(path).toBeNull();
    });

    it("should reject paths that start with /login", () => {
      sessionStorage.setItem("auth_redirect_path", "/login");
      const path = getAndClearRedirectPath();

      expect(path).toBeNull();
      expect(sessionStorage.getItem("auth_redirect_path")).toBeNull(); // Should still be cleared
    });

    it("should reject paths that start with /auth", () => {
      sessionStorage.setItem("auth_redirect_path", "/auth/callback");
      const path = getAndClearRedirectPath();

      expect(path).toBeNull();
      expect(sessionStorage.getItem("auth_redirect_path")).toBeNull();
    });

    it("should reject paths that start with /signup", () => {
      sessionStorage.setItem("auth_redirect_path", "/signup");
      const path = getAndClearRedirectPath();

      expect(path).toBeNull();
      expect(sessionStorage.getItem("auth_redirect_path")).toBeNull();
    });

    it("should reject paths that do not start with /", () => {
      sessionStorage.setItem("auth_redirect_path", "todos");
      const path = getAndClearRedirectPath();

      expect(path).toBeNull();
      expect(sessionStorage.getItem("auth_redirect_path")).toBeNull();
    });

    it("should accept valid paths", () => {
      const validPaths = ["/", "/todos", "/dashboard", "/settings", "/profile/123"];

      validPaths.forEach((validPath) => {
        sessionStorage.setItem("auth_redirect_path", validPath);
        const path = getAndClearRedirectPath();
        expect(path).toBe(validPath);
      });
    });

    it("should handle errors gracefully", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock sessionStorage.getItem to throw an error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      const path = getAndClearRedirectPath();
      expect(path).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();

      // Restore
      Storage.prototype.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe("clearRedirectPath", () => {
    it("should remove the stored path", () => {
      sessionStorage.setItem("auth_redirect_path", "/todos");
      clearRedirectPath();
      expect(sessionStorage.getItem("auth_redirect_path")).toBeNull();
    });

    it("should not throw if no path is stored", () => {
      expect(() => clearRedirectPath()).not.toThrow();
    });

    it("should handle errors gracefully", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock sessionStorage.removeItem to throw an error
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => clearRedirectPath()).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalled();

      // Restore
      Storage.prototype.removeItem = originalRemoveItem;
      consoleWarnSpy.mockRestore();
    });
  });
});
