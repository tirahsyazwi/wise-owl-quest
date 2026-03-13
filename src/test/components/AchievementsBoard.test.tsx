import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AchievementsBoard from "@/components/AchievementsBoard";
import { achievements } from "@/data/achievements";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, style, ...props }: any) => <div style={style} {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock supabase - return some completed missions
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: (col: string, val: any) => {
          if (col === "completed") {
            return {
              eq: () => Promise.resolve({
                data: [
                  { mission_id: "m01", mission_type: "pattern", difficulty: 1, attempts: 1, hints_used: 0, solve_time_seconds: 20, coins_earned: 5, xp_earned: 10 },
                  { mission_id: "m02", mission_type: "pattern", difficulty: 1, attempts: 2, hints_used: 1, solve_time_seconds: 45, coins_earned: 5, xp_earned: 10 },
                  { mission_id: "m03", mission_type: "logic", difficulty: 1, attempts: 1, hints_used: 0, solve_time_seconds: 15, coins_earned: 5, xp_earned: 10 },
                ],
              }),
            };
          }
          return {
            eq: () => Promise.resolve({ data: [] }),
          };
        },
      }),
    }),
  },
}));

describe("AchievementsBoard", () => {
  it("renders achievements title", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => {
      expect(screen.getByText("Achievements")).toBeInTheDocument();
    });
  });

  it("shows progress count", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => {
      expect(screen.getByText(/Test has earned/)).toBeInTheDocument();
    });
  });

  it("renders category filter buttons", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => {
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Missions")).toBeInTheDocument();
      expect(screen.getByText("Skills")).toBeInTheDocument();
      expect(screen.getByText("Special")).toBeInTheDocument();
      expect(screen.getByText("Streaks")).toBeInTheDocument();
    });
  });

  it("renders all achievements by default", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => {
      achievements.forEach((a) => {
        expect(screen.getByText(a.title)).toBeInTheDocument();
      });
    });
  });

  it("filters achievements by category", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => screen.getByText("Missions"));
    fireEvent.click(screen.getByText("Missions"));

    const missionAchievements = achievements.filter(a => a.category === "missions");
    const otherAchievements = achievements.filter(a => a.category !== "missions");

    missionAchievements.forEach(a => {
      expect(screen.getByText(a.title)).toBeInTheDocument();
    });
    otherAchievements.forEach(a => {
      expect(screen.queryByText(a.title)).not.toBeInTheDocument();
    });
  });

  it("shows earned badge with icon, locked badge with lock icon", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => {
      // "Liftoff!" should be earned (1+ missions completed)
      expect(screen.getByText("Liftoff!")).toBeInTheDocument();
      // Should show lock icons for unearned
      const locks = screen.getAllByText("🔒");
      expect(locks.length).toBeGreaterThan(0);
    });
  });

  it("displays progress bar", async () => {
    render(<AchievementsBoard childId="child-1" childName="Test" />);
    await waitFor(() => {
      const progressText = screen.getByText(/\/20/);
      expect(progressText).toBeInTheDocument();
    });
  });

  it("uses childName in description text", async () => {
    render(<AchievementsBoard childId="child-1" childName="Alex" />);
    await waitFor(() => {
      expect(screen.getByText(/Alex has earned/)).toBeInTheDocument();
    });
  });

  it("uses 'You have' when no childName provided", async () => {
    render(<AchievementsBoard childId="child-1" />);
    await waitFor(() => {
      expect(screen.getByText(/You have earned/)).toBeInTheDocument();
    });
  });
});
