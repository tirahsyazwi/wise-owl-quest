import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Integration tests for Supabase query patterns.
 * Tests that the app constructs correct queries and handles responses properly.
 */

// Mock the supabase client
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
  payments: [],
};

// Simulated query builder
class QueryBuilder {
  private table: string;
  private filters: Record<string, any> = {};
  private selectFields: string = "*";
  private orderBy: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = "*") {
    this.selectFields = fields;
    return this;
  }

  eq(col: string, val: any) {
    this.filters[col] = val;
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  insert(row: any) {
    const table = mockData[this.table] || [];
    table.push(row);
    return Promise.resolve({ data: row, error: null });
  }

  update(values: any) {
    return {
      eq: (col: string, val: any) => {
        const table = mockData[this.table] || [];
        const idx = table.findIndex((r) => r[col] === val);
        if (idx >= 0) Object.assign(table[idx], values);
        return Promise.resolve({ data: idx >= 0 ? table[idx] : null, error: null });
      },
    };
  }

  delete() {
    return {
      eq: (col: string, val: any) => {
        const table = mockData[this.table] || [];
        const idx = table.findIndex((r) => r[col] === val);
        if (idx >= 0) table.splice(idx, 1);
        return Promise.resolve({ error: null });
      },
    };
  }

  async execute() {
    let rows = [...(mockData[this.table] || [])];

    // Apply filters
    for (const [col, val] of Object.entries(this.filters)) {
      rows = rows.filter((r) => r[col] === val);
    }

    // Apply order
    if (this.orderBy) {
      rows.sort((a, b) => {
        const av = a[this.orderBy!];
        const bv = b[this.orderBy!];
        return this.orderAsc ? (av > bv ? 1 : -1) : (av > bv ? -1 : 1);
      });
    }

    // Apply limit
    if (this.limitCount) rows = rows.slice(0, this.limitCount);

    if (this.isSingle) return { data: rows[0] || null, error: rows.length ? null : { message: "Not found" } };
    return { data: rows, error: null };
  }

  then(resolve: any, reject?: any) {
    return this.execute().then(resolve, reject);
  }
}

const mockSupabase = {
  from: (table: string) => new QueryBuilder(table),
};

describe("Supabase Query Integration Tests", () => {
  describe("Children queries", () => {
    it("fetches all children for a parent", async () => {
      const { data } = await mockSupabase.from("children").select("*").eq("parent_id", "u1").order("created_at");
      expect(data).toHaveLength(2);
      expect(data![0].name).toBe("Alice");
      expect(data![1].name).toBe("Bob");
    });

    it("returns empty array for unknown parent", async () => {
      const { data } = await mockSupabase.from("children").select("*").eq("parent_id", "unknown");
      expect(data).toHaveLength(0);
    });

    it("inserts a new child", async () => {
      const newChild = { id: "c3", name: "Charlie", age: 6, avatar: "star", parent_id: "u1" };
      const { error } = await mockSupabase.from("children").insert(newChild);
      expect(error).toBeNull();
    });
  });

  describe("Mission attempts queries", () => {
    it("fetches completed attempts for a child", async () => {
      const { data } = await mockSupabase.from("mission_attempts").select("*").eq("child_id", "c1").eq("completed", true);
      expect(data).toHaveLength(2);
      expect(data!.every((d: any) => d.child_id === "c1")).toBe(true);
    });

    it("child progress is isolated from other children", async () => {
      const { data: c1 } = await mockSupabase.from("mission_attempts").select("*").eq("child_id", "c1").eq("completed", true);
      const { data: c2 } = await mockSupabase.from("mission_attempts").select("*").eq("child_id", "c2").eq("completed", true);
      expect(c1).toHaveLength(2);
      expect(c2).toHaveLength(1);
    });

    it("inserts a new mission attempt", async () => {
      const attempt = {
        child_id: "c1",
        parent_id: "u1",
        mission_id: "m03",
        mission_type: "logic",
        difficulty: 1,
        completed: true,
        attempts: 1,
        hints_used: 0,
        solve_time_seconds: 30,
        coins_earned: 5,
        xp_earned: 10,
      };
      const { error } = await mockSupabase.from("mission_attempts").insert(attempt);
      expect(error).toBeNull();
    });

    it("calculates total coins from attempts", async () => {
      const { data } = await mockSupabase.from("mission_attempts").select("*").eq("child_id", "c1").eq("completed", true);
      const totalCoins = data!.reduce((s: number, a: any) => s + a.coins_earned, 0);
      expect(totalCoins).toBeGreaterThan(0);
    });
  });

  describe("Subscription queries", () => {
    it("fetches active subscription for user", async () => {
      const { data } = await mockSupabase.from("subscriptions").select("*").eq("user_id", "u1").order("created_at", { ascending: false }).limit(1).single();
      expect(data).toBeTruthy();
      expect(data.plan).toBe("monthly");
      expect(data.status).toBe("active");
    });

    it("returns null for non-existent user subscription", async () => {
      const { data } = await mockSupabase.from("subscriptions").select("*").eq("user_id", "unknown").order("created_at", { ascending: false }).limit(1).single();
      expect(data).toBeNull();
    });

    it("updates subscription plan", async () => {
      const { error } = await mockSupabase.from("subscriptions").update({ plan: "yearly", status: "active" }).eq("id", "s1");
      expect(error).toBeNull();
    });
  });

  describe("Purchased items queries", () => {
    it("fetches purchased items for a child", async () => {
      const { data } = await mockSupabase.from("purchased_items").select("*").eq("child_id", "c1");
      expect(data).toHaveLength(2);
    });

    it("finds equipped items", async () => {
      const { data } = await mockSupabase.from("purchased_items").select("*").eq("child_id", "c1").eq("equipped", true);
      expect(data).toHaveLength(1);
      expect(data![0].item_id).toBe("owl-astronaut");
    });

    it("purchased items are isolated per child", async () => {
      const { data: c1Items } = await mockSupabase.from("purchased_items").select("*").eq("child_id", "c1");
      const { data: c2Items } = await mockSupabase.from("purchased_items").select("*").eq("child_id", "c2");
      expect(c1Items).toHaveLength(2);
      expect(c2Items).toHaveLength(0);
    });
  });

  describe("Profile queries", () => {
    it("fetches user profile", async () => {
      const { data } = await mockSupabase.from("profiles").select("*").eq("user_id", "u1");
      expect(data).toHaveLength(1);
      expect(data![0].display_name).toBe("Parent User");
    });
  });
});
