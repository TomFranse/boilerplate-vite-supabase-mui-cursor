import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useAuthRedirect } from "./useAuthRedirect";
import { useAuthContext } from "@/shared/context/AuthContext";
import * as redirectUtils from "@/utils/redirectUtils";

// Mock dependencies
vi.mock("@/shared/context/AuthContext");
vi.mock("@/utils/redirectUtils");
vi.mock("@config/entreefederatie", () => ({
  getEntreefederatieDomain: vi.fn(() => "example.com"),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("useAuthRedirect", () => {
  const defaultAuthContext = {
    user: null,
    loading: false,
    error: null,
    login: vi.fn(),
    signUp: vi.fn(),
    logout: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithEntreefederatie: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    try {
      sessionStorage.removeItem("auth_redirect_path");
    } catch {
      // Ignore errors
    }
    mockNavigate.mockClear();
    // Set default mock return value
    vi.mocked(useAuthContext).mockReturnValue(defaultAuthContext);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  it("should redirect to stored path when user logs in successfully", async () => {
    const mockGetAndClearRedirectPath = vi.spyOn(redirectUtils, "getAndClearRedirectPath");
    mockGetAndClearRedirectPath.mockReturnValue("/dashboard");

    const { rerender } = renderHook(() => useAuthRedirect(), { wrapper });

    // User logs in
    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
    });

    rerender();

    await waitFor(() => {
      expect(mockGetAndClearRedirectPath).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });

  it("should redirect to home when no stored path exists", async () => {
    const mockGetAndClearRedirectPath = vi.spyOn(redirectUtils, "getAndClearRedirectPath");
    mockGetAndClearRedirectPath.mockReturnValue(null);

    const { rerender } = renderHook(() => useAuthRedirect(), { wrapper });

    // User logs in
    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
    });

    rerender();

    await waitFor(() => {
      expect(mockGetAndClearRedirectPath).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("should not redirect when user is loading", () => {
    const mockGetAndClearRedirectPath = vi.spyOn(redirectUtils, "getAndClearRedirectPath");

    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
      loading: true,
    });

    renderHook(() => useAuthRedirect(), { wrapper });

    expect(mockGetAndClearRedirectPath).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not redirect when there is an error", () => {
    const mockGetAndClearRedirectPath = vi.spyOn(redirectUtils, "getAndClearRedirectPath");

    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
      error: "Login failed",
    });

    renderHook(() => useAuthRedirect(), { wrapper });

    expect(mockGetAndClearRedirectPath).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not redirect multiple times", async () => {
    const mockGetAndClearRedirectPath = vi.spyOn(redirectUtils, "getAndClearRedirectPath");
    mockGetAndClearRedirectPath.mockReturnValue("/dashboard");

    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
    });

    const { rerender } = renderHook(() => useAuthRedirect(), { wrapper });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    // Rerender multiple times - should not redirect again
    rerender();
    rerender();
    rerender();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  it("should reset redirect flag when user logs out", async () => {
    const mockGetAndClearRedirectPath = vi.spyOn(redirectUtils, "getAndClearRedirectPath");
    mockGetAndClearRedirectPath.mockReturnValue("/dashboard");

    const { rerender } = renderHook(() => useAuthRedirect(), { wrapper });

    // User logs in
    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
    });

    rerender();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    mockNavigate.mockClear();
    mockGetAndClearRedirectPath.mockClear();
    mockGetAndClearRedirectPath.mockReturnValue("/dashboard");

    // User logs out
    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: null,
    });

    rerender();

    // User logs in again - should redirect again
    vi.mocked(useAuthContext).mockReturnValue({
      ...defaultAuthContext,
      user: { id: "123", email: "test@example.com", created_at: "2024-01-01" },
    });

    rerender();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  it("should return a function to reset redirect flag", () => {
    vi.mocked(useAuthContext).mockReturnValue(defaultAuthContext);

    const { result } = renderHook(() => useAuthRedirect(), { wrapper });

    expect(typeof result.current).toBe("function");
    expect(() => result.current()).not.toThrow();
  });
});
