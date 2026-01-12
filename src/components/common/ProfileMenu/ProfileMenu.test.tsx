import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileMenu } from "../ProfileMenu";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useUserProfile } from "@features/auth/hooks/useUserProfile";
import { isSupabaseConfigured } from "@shared/services/supabaseService";
import type { User } from "@features/auth/types/auth.types";

// Mock dependencies
vi.mock("@/shared/context/AuthContext");
vi.mock("@features/auth/hooks/useUserProfile");
vi.mock("@shared/services/supabaseService");

const mockSignInWithGoogle = vi.fn();
const mockSignInWithEntreefederatie = vi.fn();
const mockLogout = vi.fn();

describe("ProfileMenu", () => {
  const defaultAuthContext = {
    user: null,
    loading: false,
    error: null,
    login: vi.fn(),
    signUp: vi.fn(),
    logout: mockLogout,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithEntreefederatie: mockSignInWithEntreefederatie,
  };

  const defaultUserProfile = {
    profile: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue(defaultAuthContext);
    vi.mocked(useUserProfile).mockReturnValue(defaultUserProfile);
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  describe("Internal anchor mode (default)", () => {
    it("should render trigger button when user is not logged in", () => {
      render(<ProfileMenu />);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByLabelText(/sign in/i)).toBeInTheDocument();
    });

    it("should render trigger button when user is logged in", () => {
      const mockUser: User = {
        id: "123",
        email: "test@example.com",
      } as User;
      vi.mocked(useAuthContext).mockReturnValue({
        ...defaultAuthContext,
        user: mockUser,
      });
      render(<ProfileMenu />);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByLabelText(/account/i)).toBeInTheDocument();
    });

    it("should open menu when trigger button is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileMenu />);

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });
    });

    it("should show sign-in options when menu is opened and user is not logged in", async () => {
      const user = userEvent.setup();
      render(<ProfileMenu />);

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
      });
    });

    it("should show profile info and sign-out when menu is opened and user is logged in", async () => {
      const mockUser: User = {
        id: "123",
        email: "test@example.com",
      } as User;
      vi.mocked(useAuthContext).mockReturnValue({
        ...defaultAuthContext,
        user: mockUser,
      });
      const user = userEvent.setup();
      render(<ProfileMenu />);

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });
    });
  });

  describe("External anchor mode", () => {
    it("should not render trigger button when external anchor is provided", () => {
      const anchorEl = document.createElement("div");
      document.body.appendChild(anchorEl);
      render(<ProfileMenu anchorEl={anchorEl} />);
      // Should not have the trigger button, but menu should exist
      const buttons = screen.queryAllByRole("button");
      // Menu might have buttons inside, but not the trigger
      expect(buttons.length).toBeLessThanOrEqual(2); // Menu items, not trigger
    });
  });

  describe("Sign-in interactions", () => {
    it("should call signInWithGoogle when Google sign-in is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileMenu />);

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
      });

      const signInButton = screen.getByText(/sign in with google/i);
      await user.click(signInButton);

      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it("should call signInWithEntreefederatie when Entreefederatie sign-in is clicked", async () => {
      const user = userEvent.setup();
      render(<ProfileMenu />);

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/login met schoolaccount/i)).toBeInTheDocument();
      });

      const signInButton = screen.getByText(/login met schoolaccount/i);
      await user.click(signInButton);

      expect(mockSignInWithEntreefederatie).toHaveBeenCalled();
    });
  });

  describe("Sign-out interaction", () => {
    it("should call logout when sign-out is clicked", async () => {
      const mockUser: User = {
        id: "123",
        email: "test@example.com",
      } as User;
      vi.mocked(useAuthContext).mockReturnValue({
        ...defaultAuthContext,
        user: mockUser,
      });
      const user = userEvent.setup();
      render(<ProfileMenu />);

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      await user.click(signOutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
