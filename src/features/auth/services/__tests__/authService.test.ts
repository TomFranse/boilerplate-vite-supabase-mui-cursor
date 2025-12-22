import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../authService";

// Mock Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
};

vi.mock("@shared/services/supabaseService", () => ({
  getSupabase: vi.fn(() => mockSupabase),
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        created_at: "2024-01-01",
      };

      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as unknown as Awaited<ReturnType<typeof mockSupabase.auth.signInWithPassword>>);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.error).toBeNull();
      expect(result.user).toEqual({
        id: "123",
        email: "test@example.com",
        created_at: "2024-01-01",
      });
    });

    it("should return error on invalid credentials", async () => {
      const mockError = { message: "Invalid credentials" };

      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as unknown as Awaited<ReturnType<typeof mockSupabase.auth.signInWithPassword>>);

      const result = await authService.login({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({
        error: null,
      } as unknown as Awaited<ReturnType<typeof mockSupabase.auth.signOut>>);

      const result = await authService.logout();

      expect(result.error).toBeNull();
    });
  });
});
