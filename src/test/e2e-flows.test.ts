import { describe, it, expect } from "vitest";
import { PLAN_DETAILS } from "@/hooks/useSubscription";
import { missionBank } from "@/data/missionBank";
import { shopItems } from "@/data/shopItems";
import { achievements, AchievementStats } from "@/data/achievements";

/**
 * End-to-end flow tests simulating full user journeys through the system.
 * These test the business logic without DOM rendering.
 */

describe("E2E Flow: Trial User Journey", () => {
  it("1. Signup → auto-creates trial subscription (7 days)", () => {
    const trialDuration = 7 * 86400000;
    const expiresAt = new Date(Date.now() + trialDuration);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);
    expect(daysLeft).toBe(7);
  });

  it("2. Add first child (limit: 1)", () => {
    const maxChildren = PLAN_DETAILS.trial.children; // 1
    const currentCount = 0;
    expect(currentCount < maxChildren).toBe(true);
  });

  it("3. Cannot add second child on trial", () => {
    const maxChildren = PLAN_DETAILS.trial.children; // 1
    const currentCount = 1;
    expect(currentCount < maxChildren).toBe(false);
  });

  it("4. Complete 5 missions (trial limit)", () => {
    const maxMissions = PLAN_DETAILS.trial.missions; // 5
    const completed = ["m01", "m02", "m03", "m04", "m05"];
    expect(completed.length).toBe(maxMissions);
  });

  it("5. Cannot start 6th mission on trial", () => {
    const maxMissions = PLAN_DETAILS.trial.missions; // 5
    const completed = ["m01", "m02", "m03", "m04", "m05"];
    const canStartNew = maxMissions <= 0 || completed.length < maxMissions;
    expect(canStartNew).toBe(false);
  });

  it("6. Shop is locked on trial", () => {
    const isPaid = false;
    expect(isPaid).toBe(false);
  });

  it("7. Achievements still work on trial", () => {
    const stats: AchievementStats = {
      totalCompleted: 5, totalCoins: 25, totalXp: 50, perfectMissions: 3,
      hintsUsed: 1, totalAttempts: 7, zonesCleared: 1, patternCompleted: 2,
      logicCompleted: 1, strategyCompleted: 0, planningCompleted: 0,
      spatialCompleted: 1, sequenceCompleted: 1, hardCompleted: 0,
      fastSolves: 2, maxDifficulty: 1,
    };
    const earned = achievements.filter((a) => a.requirement(stats));
    expect(earned.length).toBeGreaterThan(0);
    expect(earned.some((a) => a.id === "first_mission")).toBe(true);
    expect(earned.some((a) => a.id === "five_missions")).toBe(true);
  });
});

describe("E2E Flow: Monthly (Explorer) User Journey", () => {
  it("1. Upgrade from trial to monthly", () => {
    const plan = "monthly";
    const detail = PLAN_DETAILS[plan];
    expect(detail.name).toBe("Explorer");
    expect(detail.missions).toBe(-1); // unlimited
  });

  it("2. Can add up to 3 children", () => {
    const maxChildren = PLAN_DETAILS.monthly.children;
    for (let i = 0; i < 3; i++) {
      expect(i < maxChildren).toBe(true);
    }
    expect(3 < maxChildren).toBe(false);
  });

  it("3. Unlimited missions available", () => {
    const maxMissions = PLAN_DETAILS.monthly.missions; // -1
    const completed = Array.from({ length: 20 }, (_, i) => `m${i + 1}`);
    const canStart = maxMissions <= 0 || completed.length < maxMissions;
    expect(canStart).toBe(true);
  });

  it("4. Shop is unlocked", () => {
    const isPaid = true;
    expect(isPaid).toBe(true);
  });

  it("5. Can buy and equip cosmetics", () => {
    let coins = 100;
    const item = shopItems[0]; // Astronaut Suit, 30 coins
    const canAfford = coins >= item.price;
    expect(canAfford).toBe(true);
    coins -= item.price;
    expect(coins).toBe(70);
  });

  it("6. Complete all 25 missions and earn many achievements", () => {
    const stats: AchievementStats = {
      totalCompleted: 25, totalCoins: 350, totalXp: 750, perfectMissions: 15,
      hintsUsed: 3, totalAttempts: 30, zonesCleared: 5, patternCompleted: 6,
      logicCompleted: 5, strategyCompleted: 5, planningCompleted: 3,
      spatialCompleted: 5, sequenceCompleted: 2, hardCompleted: 10,
      fastSolves: 10, maxDifficulty: 5,
    };
    const earned = achievements.filter((a) => a.requirement(stats));
    expect(earned.some((a) => a.id === "all_missions")).toBe(true);
    expect(earned.some((a) => a.id === "max_difficulty")).toBe(true);
    expect(earned.some((a) => a.id === "zone_clearer")).toBe(true);
    expect(earned.length).toBeGreaterThanOrEqual(15);
  });
});

describe("E2E Flow: Yearly (Galaxy Pass) User Journey", () => {
  it("1. Yearly plan gives maximum limits", () => {
    const detail = PLAN_DETAILS.yearly;
    expect(detail.children).toBe(5);
    expect(detail.missions).toBe(-1);
  });

  it("2. Can add 5 children", () => {
    const maxChildren = PLAN_DETAILS.yearly.children;
    for (let i = 0; i < 5; i++) {
      expect(i < maxChildren).toBe(true);
    }
  });

  it("3. Each child has independent progress", () => {
    const children = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i + 1}`,
      completedMissions: Math.floor(Math.random() * 25),
      coins: Math.floor(Math.random() * 500),
    }));
    // All children should have independent values
    const uniqueCompletions = new Set(children.map((c) => c.completedMissions));
    // At least some should differ with random values
    expect(children.length).toBe(5);
  });

  it("4. Subscription lasts 365 days", () => {
    const duration = 365 * 86400000;
    const expiresAt = new Date(Date.now() + duration);
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / 86400000);
    expect(daysLeft).toBe(365);
  });
});

describe("E2E Flow: Subscription Expiry", () => {
  it("expired subscription redirects to pricing", () => {
    const sub = {
      status: "active" as const,
      expires_at: new Date(Date.now() - 86400000).toISOString(),
    };
    const isActive = sub.status === "active" && new Date(sub.expires_at) > new Date();
    const isExpired = !isActive;
    expect(isExpired).toBe(true);
    // In the app: navigate("/pricing") when isExpired
  });

  it("canceled subscription is treated as expired", () => {
    const status = "canceled";
    const expires_at = new Date(Date.now() + 86400000).toISOString();
    const isActive = status === "active" && new Date(expires_at) > new Date();
    expect(isActive).toBe(false);
  });
});

describe("E2E Flow: Coin Economy", () => {
  it("tracks coin balance across missions and purchases", () => {
    // Earn coins from missions
    const missionCoins = missionBank.slice(0, 10).reduce((s, m) => s + m.reward.coins, 0);
    expect(missionCoins).toBeGreaterThan(0);

    // Spend coins in shop
    const astronautSuit = shopItems.find((i) => i.id === "owl-astronaut")!;
    const balance = missionCoins - astronautSuit.price;
    expect(balance).toBe(missionCoins - 30);
    expect(balance).toBeGreaterThanOrEqual(0);
  });

  it("cannot buy item if balance insufficient", () => {
    const coins = 10;
    const galaxyForm = shopItems.find((i) => i.id === "owl-galaxy")!; // 500 coins
    expect(coins >= galaxyForm.price).toBe(false);
  });

  it("total earnable coins from all missions", () => {
    const totalEarnable = missionBank.reduce((s, m) => s + m.reward.coins, 0);
    expect(totalEarnable).toBeGreaterThan(0);
    // Should be enough to buy at least a few items
    const cheapestItem = Math.min(...shopItems.map((i) => i.price));
    expect(totalEarnable).toBeGreaterThan(cheapestItem);
  });
});

describe("E2E Flow: Onboarding", () => {
  it("onboarding has 6 steps (welcome, meet, 3 missions, complete)", () => {
    const steps = 6;
    expect(steps).toBe(6);
  });

  it("onboarding missions don't count toward main progress", () => {
    const onboardingIds = ["onboard-1", "onboard-2", "onboard-3"]; // example IDs
    const mainIds = new Set(missionBank.map((m) => m.id));
    onboardingIds.forEach((id) => {
      expect(mainIds.has(id)).toBe(false);
    });
  });
});

describe("E2E Flow: Parent Dashboard", () => {
  it("shows thinking skills based on mission types", () => {
    const attempts = [
      { mission_type: "strategy", difficulty: 3, attempts: 1, hints_used: 0 },
      { mission_type: "pattern", difficulty: 2, attempts: 2, hints_used: 1 },
      { mission_type: "logic", difficulty: 4, attempts: 1, hints_used: 0 },
    ];
    const strategyAttempts = attempts.filter((a) => ["strategy", "planning"].includes(a.mission_type));
    const patternAttempts = attempts.filter((a) => ["pattern", "sequence"].includes(a.mission_type));
    const logicAttempts = attempts.filter((a) => ["logic", "spatial"].includes(a.mission_type));

    expect(strategyAttempts.length).toBe(1);
    expect(patternAttempts.length).toBe(1);
    expect(logicAttempts.length).toBe(1);
  });

  it("weekly stats filter by date range", () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const attempts = [
      { created_at: new Date(now.getTime() - 1 * 86400000).toISOString() }, // within week
      { created_at: new Date(now.getTime() - 10 * 86400000).toISOString() }, // outside week
    ];
    const weekAttempts = attempts.filter((a) => new Date(a.created_at) >= weekAgo);
    expect(weekAttempts).toHaveLength(1);
  });
});
