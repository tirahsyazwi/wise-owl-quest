import { describe, it, expect } from "vitest";
import { achievements, AchievementStats, tierColors, tierBgColors } from "@/data/achievements";

const emptyStats: AchievementStats = {
  totalCompleted: 0, totalCoins: 0, totalXp: 0, perfectMissions: 0,
  hintsUsed: 0, totalAttempts: 0, zonesCleared: 0, patternCompleted: 0,
  logicCompleted: 0, strategyCompleted: 0, planningCompleted: 0,
  spatialCompleted: 0, sequenceCompleted: 0, hardCompleted: 0,
  fastSolves: 0, maxDifficulty: 0,
};

describe("Achievements System", () => {
  describe("Achievement Definitions", () => {
    it("has 20 achievements total", () => {
      expect(achievements).toHaveLength(20);
    });

    it("all achievements have unique IDs", () => {
      const ids = achievements.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all achievements have requirement functions", () => {
      achievements.forEach((a) => {
        expect(typeof a.requirement).toBe("function");
      });
    });

    it("all tiers have colors defined", () => {
      const tiers = ["bronze", "silver", "gold", "cosmic"] as const;
      tiers.forEach((t) => {
        expect(tierColors[t]).toBeDefined();
        expect(tierBgColors[t]).toBeDefined();
      });
    });
  });

  describe("No Achievements with Empty Stats", () => {
    it("no achievements are earned with zero stats", () => {
      const earned = achievements.filter((a) => a.requirement(emptyStats));
      expect(earned).toHaveLength(0);
    });
  });

  describe("Mission Milestone Achievements", () => {
    it("Liftoff! unlocks at 1 mission", () => {
      const stats = { ...emptyStats, totalCompleted: 1 };
      const liftoff = achievements.find((a) => a.id === "first_mission")!;
      expect(liftoff.requirement(stats)).toBe(true);
    });

    it("Space Cadet unlocks at 5 missions", () => {
      const stats = { ...emptyStats, totalCompleted: 5 };
      const badge = achievements.find((a) => a.id === "five_missions")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Star Pilot unlocks at 10 missions", () => {
      const stats = { ...emptyStats, totalCompleted: 10 };
      const badge = achievements.find((a) => a.id === "ten_missions")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Galaxy Explorer unlocks at 20 missions", () => {
      const stats = { ...emptyStats, totalCompleted: 20 };
      const badge = achievements.find((a) => a.id === "twenty_missions")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Universe Champion unlocks at 25 missions", () => {
      const stats = { ...emptyStats, totalCompleted: 25 };
      const badge = achievements.find((a) => a.id === "all_missions")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Universe Champion does NOT unlock at 24 missions", () => {
      const stats = { ...emptyStats, totalCompleted: 24 };
      const badge = achievements.find((a) => a.id === "all_missions")!;
      expect(badge.requirement(stats)).toBe(false);
    });
  });

  describe("Skill Achievements", () => {
    it("Pattern Spotter unlocks at 5 pattern missions", () => {
      const stats = { ...emptyStats, patternCompleted: 5 };
      const badge = achievements.find((a) => a.id === "pattern_master")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Logic Whiz unlocks at 5 logic missions", () => {
      const stats = { ...emptyStats, logicCompleted: 5 };
      const badge = achievements.find((a) => a.id === "logic_whiz")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Strategy Ace unlocks at 5 strategy missions", () => {
      const stats = { ...emptyStats, strategyCompleted: 5 };
      const badge = achievements.find((a) => a.id === "strategy_ace")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Master Planner unlocks at 3 planning missions", () => {
      const stats = { ...emptyStats, planningCompleted: 3 };
      const badge = achievements.find((a) => a.id === "planner_pro")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Space Navigator unlocks at 5 spatial missions", () => {
      const stats = { ...emptyStats, spatialCompleted: 5 };
      const badge = achievements.find((a) => a.id === "spatial_sense")!;
      expect(badge.requirement(stats)).toBe(true);
    });
  });

  describe("Special Achievements", () => {
    it("Sharp Mind unlocks at 3 perfect missions", () => {
      const stats = { ...emptyStats, perfectMissions: 3 };
      const badge = achievements.find((a) => a.id === "perfect_three")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Brilliant Brain unlocks at 10 perfect missions", () => {
      const stats = { ...emptyStats, perfectMissions: 10 };
      const badge = achievements.find((a) => a.id === "perfect_ten")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Lightning Fast unlocks at 3 fast solves", () => {
      const stats = { ...emptyStats, fastSolves: 3 };
      const badge = achievements.find((a) => a.id === "speed_demon")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Fearless Explorer unlocks at 3 hard missions", () => {
      const stats = { ...emptyStats, hardCompleted: 3 };
      const badge = achievements.find((a) => a.id === "hard_mode")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Zone Master unlocks when 1 zone is cleared", () => {
      const stats = { ...emptyStats, zonesCleared: 1 };
      const badge = achievements.find((a) => a.id === "zone_clearer")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Treasure Hunter unlocks at 200 coins", () => {
      const stats = { ...emptyStats, totalCoins: 200 };
      const badge = achievements.find((a) => a.id === "coin_collector")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("XP Legend unlocks at 500 XP", () => {
      const stats = { ...emptyStats, totalXp: 500 };
      const badge = achievements.find((a) => a.id === "xp_master")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Supernova Mind unlocks at difficulty 5", () => {
      const stats = { ...emptyStats, maxDifficulty: 5 };
      const badge = achievements.find((a) => a.id === "max_difficulty")!;
      expect(badge.requirement(stats)).toBe(true);
    });

    it("Never Give Up requires 10+ attempts AND 5+ completed", () => {
      const badge = achievements.find((a) => a.id === "persistence")!;
      // Not enough completed
      expect(badge.requirement({ ...emptyStats, totalAttempts: 10, totalCompleted: 4 })).toBe(false);
      // Not enough attempts
      expect(badge.requirement({ ...emptyStats, totalAttempts: 9, totalCompleted: 5 })).toBe(false);
      // Both met
      expect(badge.requirement({ ...emptyStats, totalAttempts: 10, totalCompleted: 5 })).toBe(true);
    });
  });

  describe("Full Progression Scenario", () => {
    it("completing all 25 missions unlocks multiple achievements", () => {
      const fullStats: AchievementStats = {
        totalCompleted: 25,
        totalCoins: 350,
        totalXp: 700,
        perfectMissions: 15,
        hintsUsed: 5,
        totalAttempts: 35,
        zonesCleared: 5,
        patternCompleted: 6,
        logicCompleted: 5,
        strategyCompleted: 5,
        planningCompleted: 3,
        spatialCompleted: 5,
        sequenceCompleted: 2,
        hardCompleted: 10,
        fastSolves: 8,
        maxDifficulty: 5,
      };
      const earned = achievements.filter((a) => a.requirement(fullStats));
      expect(earned.length).toBeGreaterThanOrEqual(15);
      // Universe Champion should be earned
      expect(earned.some((a) => a.id === "all_missions")).toBe(true);
      // Supernova Mind should be earned
      expect(earned.some((a) => a.id === "max_difficulty")).toBe(true);
    });
  });
});
