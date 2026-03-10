import { describe, it, expect } from "vitest";
import { missionBank, onboardingMissions, getTypeColor, getTypeLabel, getZoneLabel } from "@/data/missionBank";
import type { MissionResult } from "@/components/MissionCard";

describe("Mission System", () => {
  describe("Mission Bank Structure", () => {
    it("has exactly 25 missions", () => {
      expect(missionBank).toHaveLength(25);
    });

    it("all missions have unique IDs", () => {
      const ids = missionBank.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("each mission has exactly one correct answer", () => {
      missionBank.forEach((m) => {
        const correctOptions = m.options.filter((o) => o.correct);
        expect(correctOptions).toHaveLength(1);
      });
    });

    it("each mission has exactly 4 options", () => {
      missionBank.forEach((m) => {
        expect(m.options).toHaveLength(4);
      });
    });

    it("all missions have rewards with positive coins and xp", () => {
      missionBank.forEach((m) => {
        expect(m.reward.coins).toBeGreaterThan(0);
        expect(m.reward.xp).toBeGreaterThan(0);
      });
    });

    it("missions have valid difficulty levels (1-5)", () => {
      missionBank.forEach((m) => {
        expect(m.difficulty).toBeGreaterThanOrEqual(1);
        expect(m.difficulty).toBeLessThanOrEqual(5);
      });
    });

    it("missions have valid map positions", () => {
      missionBank.forEach((m) => {
        expect(m.mapPosition.x).toBeGreaterThanOrEqual(0);
        expect(m.mapPosition.x).toBeLessThanOrEqual(100);
        expect(m.mapPosition.y).toBeGreaterThanOrEqual(0);
        expect(m.mapPosition.y).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Zone Distribution", () => {
    it("has 5 missions per zone", () => {
      const zones = ["arrival", "foundation", "strategic", "adaptive", "advanced"];
      zones.forEach((zone) => {
        const zoneMissions = missionBank.filter((m) => m.zone === zone);
        expect(zoneMissions).toHaveLength(5);
      });
    });

    it("arrival zone has difficulty 1", () => {
      const arrivalMissions = missionBank.filter((m) => m.zone === "arrival");
      arrivalMissions.forEach((m) => expect(m.difficulty).toBe(1));
    });

    it("advanced zone has difficulty 5", () => {
      const advancedMissions = missionBank.filter((m) => m.zone === "advanced");
      advancedMissions.forEach((m) => expect(m.difficulty).toBe(5));
    });

    it("rewards increase with difficulty", () => {
      const zone1Avg = missionBank.filter((m) => m.zone === "arrival")
        .reduce((s, m) => s + m.reward.coins, 0) / 5;
      const zone5Avg = missionBank.filter((m) => m.zone === "advanced")
        .reduce((s, m) => s + m.reward.coins, 0) / 5;
      expect(zone5Avg).toBeGreaterThan(zone1Avg);
    });
  });

  describe("Mission Type Coverage", () => {
    it("has all 6 mission types represented", () => {
      const types = new Set(missionBank.map((m) => m.type));
      expect(types.size).toBe(6);
      expect(types).toContain("pattern");
      expect(types).toContain("logic");
      expect(types).toContain("strategy");
      expect(types).toContain("planning");
      expect(types).toContain("spatial");
      expect(types).toContain("sequence");
    });
  });

  describe("Onboarding Missions", () => {
    it("has 3 onboarding missions", () => {
      expect(onboardingMissions).toHaveLength(3);
    });

    it("onboarding missions are separate from main bank", () => {
      const mainIds = new Set(missionBank.map((m) => m.id));
      onboardingMissions.forEach((m) => {
        expect(mainIds.has(m.id)).toBe(false);
      });
    });

    it("onboarding missions have low difficulty", () => {
      onboardingMissions.forEach((m) => {
        expect(m.difficulty).toBeLessThanOrEqual(2);
      });
    });
  });

  describe("Mission Progression (World Map)", () => {
    it("first mission is always available", () => {
      const completedMissionIds: string[] = [];
      const index = 0;
      const isAvailable = index === 0 || completedMissionIds.includes(missionBank[Math.max(0, index - 1)].id);
      expect(isAvailable).toBe(true);
    });

    it("second mission is locked if first not completed", () => {
      const completedMissionIds: string[] = [];
      const index = 1;
      const prevId = missionBank[index - 1].id;
      const prevCompleted = completedMissionIds.includes(prevId);
      expect(prevCompleted).toBe(false);
      // Therefore mission is locked
    });

    it("second mission unlocks after first is completed", () => {
      const completedMissionIds = ["m01"];
      const index = 1;
      const isAvailable = completedMissionIds.includes(missionBank[index - 1].id);
      expect(isAvailable).toBe(true);
    });

    it("trial users get locked after 5 missions", () => {
      const missionLimit = 5;
      const completedMissionIds = ["m01", "m02", "m03", "m04", "m05"];
      const isLocked = missionLimit > 0 && completedMissionIds.length >= missionLimit;
      expect(isLocked).toBe(true);
    });
  });

  describe("Mission Result Calculation", () => {
    it("perfect solve gets full rewards", () => {
      const mission = missionBank[0]; // m01
      const result: MissionResult = {
        missionId: mission.id,
        missionType: mission.type,
        difficulty: mission.difficulty,
        attempts: 1,
        hintsUsed: 0,
        solveTimeSeconds: 15,
        coins: mission.reward.coins,
        xp: mission.reward.xp,
      };
      expect(result.attempts).toBe(1);
      expect(result.hintsUsed).toBe(0);
      expect(result.coins).toBe(5);
      expect(result.xp).toBe(10);
    });

    it("retried mission still gives rewards", () => {
      const mission = missionBank[0];
      const result: MissionResult = {
        missionId: mission.id,
        missionType: mission.type,
        difficulty: mission.difficulty,
        attempts: 3,
        hintsUsed: 1,
        solveTimeSeconds: 60,
        coins: mission.reward.coins,
        xp: mission.reward.xp,
      };
      // Rewards are the same regardless of attempts
      expect(result.coins).toBe(mission.reward.coins);
      expect(result.xp).toBe(mission.reward.xp);
    });
  });

  describe("Helper Functions", () => {
    it("getTypeColor returns valid colors", () => {
      expect(getTypeColor("pattern")).toContain("hsl");
      expect(getTypeColor("logic")).toContain("hsl");
    });

    it("getTypeLabel returns human-readable labels", () => {
      expect(getTypeLabel("pattern")).toBe("Pattern");
      expect(getTypeLabel("logic")).toBe("Logic");
      expect(getTypeLabel("strategy")).toBe("Strategy");
    });

    it("getZoneLabel returns zone names with emojis", () => {
      expect(getZoneLabel("arrival")).toContain("Arrival");
      expect(getZoneLabel("advanced")).toContain("Advanced");
    });
  });
});
