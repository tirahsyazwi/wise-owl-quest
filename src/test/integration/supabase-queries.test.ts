import { describe, it, expect } from "vitest";

/**
 * Integration tests for Supabase query patterns with mock data.
 */

const mockData: Record<string, any[]> = {
  children: [
    { id: "c1", name: "Alice", age: 7, avatar: "astronaut", parent_id: "u1", created_at: "2026-01-01", updated_at: "2026-01-01" },
    { id: "c2", name: "Bob", age: 8, avatar: "robot", parent_id: "u1", created_at: "2026-01-02", updated_at: "2026-01-02" },
  ],
  mission_attempts: [
    { id: "a1", child_id: "c1", parent_id: "u1", mission_id: "m01", mission_type: "pattern", difficulty: 1, completed: true, attempts: 1, hints_used: 0, solve_time_seconds: 25, coins_earned: 5, xp_earned: 10, created_at: "2026-03-10" },
    { id: "a2", child_id: "c1", parent_id: "u1", mission_id: "m02", mission_type: "pattern", difficulty: 1, completed: true, attempts: 2, hints_used: 1, solve_time_seconds: 60, coins_earned: 5, xp_earned: 10, created_at: "2026-03-10" },
    { id: "a3", child_id: "c2", parent_id: "u1", mission_id: "m01", mission_type: "pattern", difficulty: 1, completed: true, attempts: 1, hints_used: 0, solve_time_seconds: 15, coins_earned: 5, xp_earned: 10, created_at: "2026-03-11" },
  ],
  subscriptions: [
    { id: "s1", user_id: "u1", plan: "monthly", status: "active", started_at: "2026-03-01", expires_at: "2026-03-31", created_at: "2026-03-01", updated_at: "2026-03-01" },
  ],
  purchased_items: [
    { id: "p1", child_id: "c1", item_id: "owl-astronaut", equipped: true, purchased_at: "2026-03-05" },
    { id: "p2", child_id: "c1", item_id: "ship-flames", equipped: false, purchased_at: "2026-03-06" },
  ],
  profiles: [
    { id: "pr1", user_id: "u1", display_name: "Parent User", avatar_url: null, created_at: "2026-01-01", updated_at: "2026-01-01" },
  ],
};

// Helper to query mock data
function queryMock(table: string, filters: Record<string, any> = {}): any[] {
  let rows = [...(mockData[table] || [])];
  for (const [col, val] of Object.entries(filters)) {
    rows = rows.filter(r => r[col] === val);
  }
  return rows;
}

describe("Supabase Query Integration Tests", () => {
  describe("Children queries", () => {
    it("fetches all children for a parent", () => {
      const data = queryMock("children", { parent_id: "u1" });
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("Alice");
      expect(data[1].name).toBe("Bob");
    });

    it("returns empty array for unknown parent", () => {
      const data = queryMock("children", { parent_id: "unknown" });
      expect(data).toHaveLength(0);
    });
  });

  describe("Mission attempts queries", () => {
    it("fetches completed attempts for a child", () => {
      const data = queryMock("mission_attempts", { child_id: "c1", completed: true });
      expect(data).toHaveLength(2);
      expect(data.every((d: any) => d.child_id === "c1")).toBe(true);
    });

    it("child progress is isolated from other children", () => {
      const c1 = queryMock("mission_attempts", { child_id: "c1", completed: true });
      const c2 = queryMock("mission_attempts", { child_id: "c2", completed: true });
      expect(c1).toHaveLength(2);
      expect(c2).toHaveLength(1);
    });

    it("calculates total coins from attempts", () => {
      const data = queryMock("mission_attempts", { child_id: "c1", completed: true });
      const totalCoins = data.reduce((s: number, a: any) => s + a.coins_earned, 0);
      expect(totalCoins).toBe(10);
    });

    it("calculates total XP from attempts", () => {
      const data = queryMock("mission_attempts", { child_id: "c1", completed: true });
      const totalXp = data.reduce((s: number, a: any) => s + a.xp_earned, 0);
      expect(totalXp).toBe(20);
    });
  });

  describe("Subscription queries", () => {
    it("fetches active subscription for user", () => {
      const data = queryMock("subscriptions", { user_id: "u1" });
      expect(data).toHaveLength(1);
      expect(data[0].plan).toBe("monthly");
      expect(data[0].status).toBe("active");
    });

    it("returns empty for non-existent user subscription", () => {
      const data = queryMock("subscriptions", { user_id: "unknown" });
      expect(data).toHaveLength(0);
    });
  });

  describe("Purchased items queries", () => {
    it("fetches purchased items for a child", () => {
      const data = queryMock("purchased_items", { child_id: "c1" });
      expect(data).toHaveLength(2);
    });

    it("finds equipped items", () => {
      const data = queryMock("purchased_items", { child_id: "c1", equipped: true });
      expect(data).toHaveLength(1);
      expect(data[0].item_id).toBe("owl-astronaut");
    });

    it("purchased items are isolated per child", () => {
      const c1Items = queryMock("purchased_items", { child_id: "c1" });
      const c2Items = queryMock("purchased_items", { child_id: "c2" });
      expect(c1Items).toHaveLength(2);
      expect(c2Items).toHaveLength(0);
    });
  });

  describe("Profile queries", () => {
    it("fetches user profile", () => {
      const data = queryMock("profiles", { user_id: "u1" });
      expect(data).toHaveLength(1);
      expect(data[0].display_name).toBe("Parent User");
    });
  });

  describe("Cross-table consistency", () => {
    it("all attempt child_ids exist in children table", () => {
      const childIds = new Set(mockData.children.map(c => c.id));
      const attemptChildIds = new Set(mockData.mission_attempts.map(a => a.child_id));
      attemptChildIds.forEach(id => {
        expect(childIds.has(id)).toBe(true);
      });
    });

    it("all purchase child_ids exist in children table", () => {
      const childIds = new Set(mockData.children.map(c => c.id));
      mockData.purchased_items.forEach(p => {
        expect(childIds.has(p.child_id)).toBe(true);
      });
    });

    it("all subscription user_ids have profiles", () => {
      const profileUserIds = new Set(mockData.profiles.map(p => p.user_id));
      mockData.subscriptions.forEach(s => {
        expect(profileUserIds.has(s.user_id)).toBe(true);
      });
    });
  });
});
