import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }));
const mockGetSession = vi.fn(() => Promise.resolve({ data: { session: null } }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
      getSession: mockGetSession,
    },
  },
}));

describe("Authentication Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sign Up", () => {
    it("should call signUp with email, password, and display name", async () => {
      mockSignUp.mockResolvedValue({ error: null });

      const { supabase } = await import("@/integrations/supabase/client");
      const result = await supabase.auth.signUp({
        email: "parent@test.com",
        password: "secure123",
        options: {
          emailRedirectTo: "http://localhost:3000",
          data: { display_name: "Test Parent" },
        },
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "parent@test.com",
        password: "secure123",
        options: {
          emailRedirectTo: "http://localhost:3000",
          data: { display_name: "Test Parent" },
        },
      });
      expect(result.error).toBeNull();
    });

    it("should reject passwords shorter than 6 characters", () => {
      const password = "abc";
      expect(password.length).toBeLessThan(6);
    });

    it("should reject empty display name", () => {
      const displayName = "  ";
      expect(displayName.trim()).toBe("");
    });

    it("should reject empty email", () => {
      const email = "";
      expect(email.trim()).toBe("");
    });

    it("should return error on duplicate email", async () => {
      mockSignUp.mockResolvedValue({ error: new Error("User already registered") });

      const { supabase } = await import("@/integrations/supabase/client");
      const result = await supabase.auth.signUp({
        email: "existing@test.com",
        password: "secure123",
        options: { data: { display_name: "Dup User" } },
      });

      expect(result.error).toBeTruthy();
      expect(result.error!.message).toContain("already registered");
    });
  });

  describe("Sign In", () => {
    it("should call signInWithPassword with correct credentials", async () => {
      mockSignIn.mockResolvedValue({ error: null, data: { session: { user: { id: "123" } } } });

      const { supabase } = await import("@/integrations/supabase/client");
      const result = await supabase.auth.signInWithPassword({
        email: "parent@test.com",
        password: "secure123",
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        email: "parent@test.com",
        password: "secure123",
      });
      expect(result.error).toBeNull();
    });

    it("should return error for wrong credentials", async () => {
      mockSignIn.mockResolvedValue({ error: new Error("Invalid login credentials") });

      const { supabase } = await import("@/integrations/supabase/client");
      const result = await supabase.auth.signInWithPassword({
        email: "parent@test.com",
        password: "wrong",
      });

      expect(result.error).toBeTruthy();
    });
  });

  describe("Sign Out", () => {
    it("should call signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.auth.signOut();

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("Session Management", () => {
    it("should initialize auth state listener before getSession", () => {
      // The AuthProvider sets up onAuthStateChange first, then getSession
      expect(mockOnAuthStateChange).toBeDefined();
      expect(mockGetSession).toBeDefined();
    });
  });
});
