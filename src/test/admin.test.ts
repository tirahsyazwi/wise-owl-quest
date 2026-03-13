import { describe, it, expect } from "vitest";
import { missionBank } from "@/data/missionBank";
import { shopItems } from "@/data/shopItems";
import { achievements, AchievementStats } from "@/data/achievements";

/**
 * Admin Dashboard feature tests
 */

describe("Admin Dashboard: Overview Metrics", () => {
  it("calculates plan distribution percentages correctly", () => {
    const subs = [
      { plan: "trial", status: "active" },
      { plan: "monthly", status: "active" },
      { plan: "monthly", status: "active" },
      { plan: "yearly", status: "active" },
    ];
    const counts = { trial: 0, monthly: 0, yearly: 0 };
    subs.forEach(s => { counts[s.plan as keyof typeof counts]++; });
    
    expect(counts.trial).toBe(1);
    expect(counts.monthly).toBe(2);
    expect(counts.yearly).toBe(1);
    
    const total = subs.length;
    expect(Math.round((counts.trial / total) * 100)).toBe(25);
    expect(Math.round((counts.monthly / total) * 100)).toBe(50);
    expect(Math.round((counts.yearly / total) * 100)).toBe(25);
  });

  it("calculates weekly active users from attempts", () => {
    const now = Date.now();
    const attempts = [
      { parent_id: "u1", created_at: new Date(now - 86400000).toISOString() },
      { parent_id: "u1", created_at: new Date(now - 172800000).toISOString() },
      { parent_id: "u2", created_at: new Date(now - 86400000).toISOString() },
      { parent_id: "u3", created_at: new Date(now - 864000000).toISOString() }, // >7 days ago
    ];
    const weekAgo = new Date(now - 7 * 86400000);
    const weeklyActive = new Set(
      attempts.filter(a => new Date(a.created_at) >= weekAgo).map(a => a.parent_id)
    );
    expect(weeklyActive.size).toBe(2); // u1 and u2
  });
});

describe("Admin Dashboard: Mission Analytics", () => {
  it("counts mission popularity correctly", () => {
    const attempts = [
      { mission_id: "m01" },
      { mission_id: "m01" },
      { mission_id: "m02" },
      { mission_id: "m01" },
    ];
    const popularity: Record<string, number> = {};
    attempts.forEach(a => { popularity[a.mission_id] = (popularity[a.mission_id] || 0) + 1; });
    expect(popularity["m01"]).toBe(3);
    expect(popularity["m02"]).toBe(1);
  });

  it("calculates type distribution", () => {
    const attempts = [
      { mission_type: "logic" },
      { mission_type: "pattern" },
      { mission_type: "logic" },
      { mission_type: "strategy" },
    ];
    const dist: Record<string, number> = {};
    attempts.forEach(a => { dist[a.mission_type] = (dist[a.mission_type] || 0) + 1; });
    expect(dist.logic).toBe(2);
    expect(dist.pattern).toBe(1);
    expect(dist.strategy).toBe(1);
  });

  it("calculates difficulty distribution", () => {
    const attempts = [
      { difficulty: 1 },
      { difficulty: 1 },
      { difficulty: 3 },
      { difficulty: 5 },
    ];
    const dist: Record<number, number> = {};
    attempts.forEach(a => { dist[a.difficulty] = (dist[a.difficulty] || 0) + 1; });
    expect(dist[1]).toBe(2);
    expect(dist[3]).toBe(1);
    expect(dist[5]).toBe(1);
  });

  it("calculates average solve time", () => {
    const times = [20, 30, 40, null, 50];
    const valid = times.filter((t): t is number => t !== null);
    const avg = Math.round(valid.reduce((s, t) => s + t, 0) / valid.length);
    expect(avg).toBe(35);
  });
});

describe("Admin Dashboard: Revenue Tracking", () => {
  it("calculates total revenue from paid payments", () => {
    const payments = [
      { amount_cents: 999, status: "paid" },
      { amount_cents: 7999, status: "paid" },
      { amount_cents: 999, status: "pending" },
    ];
    const total = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0) / 100;
    expect(total).toBe(89.98);
  });

  it("calculates pending revenue separately", () => {
    const payments = [
      { amount_cents: 999, status: "paid" },
      { amount_cents: 999, status: "pending" },
      { amount_cents: 7999, status: "pending" },
    ];
    const pending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0) / 100;
    expect(pending).toBe(89.98);
  });
});

describe("Admin Dashboard: User Management", () => {
  it("filters users by search query", () => {
    const profiles = [
      { display_name: "Alice Smith" },
      { display_name: "Bob Jones" },
      { display_name: "Alice Cooper" },
    ];
    const query = "alice";
    const filtered = profiles.filter(p => p.display_name?.toLowerCase().includes(query));
    expect(filtered).toHaveLength(2);
  });

  it("groups children under parent", () => {
    const children = [
      { parent_id: "u1", name: "Kid1" },
      { parent_id: "u1", name: "Kid2" },
      { parent_id: "u2", name: "Kid3" },
    ];
    const u1Children = children.filter(c => c.parent_id === "u1");
    expect(u1Children).toHaveLength(2);
  });
});

describe("Admin Dashboard: Engagement Analytics", () => {
  it("counts shop purchases per item", () => {
    const purchases = [
      { item_id: "owl-astronaut" },
      { item_id: "owl-astronaut" },
      { item_id: "ship-flames" },
    ];
    const itemCounts: Record<string, number> = {};
    purchases.forEach(p => { itemCounts[p.item_id] = (itemCounts[p.item_id] || 0) + 1; });
    expect(itemCounts["owl-astronaut"]).toBe(2);
    expect(itemCounts["ship-flames"]).toBe(1);
  });

  it("computes global achievement unlocks across children", () => {
    const childAttemptGroups = {
      c1: [
        { mission_id: "m01", mission_type: "pattern", difficulty: 1, attempts: 1, hints_used: 0, solve_time_seconds: 20, coins_earned: 5, xp_earned: 10 },
      ],
      c2: [
        { mission_id: "m01", mission_type: "pattern", difficulty: 1, attempts: 1, hints_used: 0, solve_time_seconds: 15, coins_earned: 5, xp_earned: 10 },
        { mission_id: "m02", mission_type: "pattern", difficulty: 1, attempts: 1, hints_used: 0, solve_time_seconds: 25, coins_earned: 5, xp_earned: 10 },
      ],
    };
    
    // Both children should unlock "first_mission"
    const firstMission = achievements.find(a => a.id === "first_mission")!;
    let unlockCount = 0;
    Object.values(childAttemptGroups).forEach(attempts => {
      const stats: AchievementStats = {
        totalCompleted: new Set(attempts.map(a => a.mission_id)).size,
        totalCoins: 0, totalXp: 0, perfectMissions: 0, hintsUsed: 0,
        totalAttempts: 0, zonesCleared: 0, patternCompleted: 0, logicCompleted: 0,
        strategyCompleted: 0, planningCompleted: 0, spatialCompleted: 0, sequenceCompleted: 0,
        hardCompleted: 0, fastSolves: 0, maxDifficulty: 0,
      };
      if (firstMission.requirement(stats)) unlockCount++;
    });
    expect(unlockCount).toBe(2);
  });

  it("counts perfect solves globally", () => {
    const attempts = [
      { attempts: 1, hints_used: 0 }, // perfect
      { attempts: 2, hints_used: 0 }, // not perfect
      { attempts: 1, hints_used: 1 }, // not perfect
      { attempts: 1, hints_used: 0 }, // perfect
    ];
    const perfectCount = attempts.filter(a => a.attempts === 1 && a.hints_used === 0).length;
    expect(perfectCount).toBe(2);
  });
});
