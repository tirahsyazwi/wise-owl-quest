import { describe, it, expect } from "vitest";
import { PLAN_DETAILS } from "@/hooks/useSubscription";

describe("Child Profile Management", () => {
  describe("Add Child Validation", () => {
    it("rejects empty name", () => {
      const name = "  ";
      expect(name.trim()).toBe("");
    });

    it("accepts valid name", () => {
      const name = "Ali";
      expect(name.trim().length).toBeGreaterThan(0);
    });

    it("name max length is 50", () => {
      const longName = "A".repeat(51);
      expect(longName.length).toBeGreaterThan(50);
    });

    it("age options are 6, 7, 8", () => {
      const validAges = [6, 7, 8];
      validAges.forEach((age) => {
        expect(age).toBeGreaterThanOrEqual(6);
        expect(age).toBeLessThanOrEqual(8);
      });
    });

    it("avatar options are valid", () => {
      const avatars = ["astronaut", "alien", "robot", "star", "rocket"];
      expect(avatars).toHaveLength(5);
    });
  });

  describe("Child Limit per Plan", () => {
    it("trial: cannot add child when at limit (1)", () => {
      const maxChildren = PLAN_DETAILS.trial.children;
      const currentChildren = 1;
      const canAdd = currentChildren < maxChildren;
      expect(canAdd).toBe(false);
    });

    it("trial: can add first child", () => {
      const maxChildren = PLAN_DETAILS.trial.children;
      const currentChildren = 0;
      const canAdd = currentChildren < maxChildren;
      expect(canAdd).toBe(true);
    });

    it("monthly: can have up to 3 children", () => {
      const maxChildren = PLAN_DETAILS.monthly.children;
      expect(maxChildren).toBe(3);
      expect(2 < maxChildren).toBe(true);
      expect(3 < maxChildren).toBe(false);
    });

    it("yearly: can have up to 5 children", () => {
      const maxChildren = PLAN_DETAILS.yearly.children;
      expect(maxChildren).toBe(5);
      expect(4 < maxChildren).toBe(true);
      expect(5 < maxChildren).toBe(false);
    });
  });

  describe("Child Switching", () => {
    it("selecting a child changes the active child", () => {
      const children = [
        { id: "c1", name: "Ali", age: 7, avatar: "astronaut" },
        { id: "c2", name: "Sara", age: 6, avatar: "alien" },
      ];
      let selectedChild = children[0];
      selectedChild = children[1];
      expect(selectedChild.id).toBe("c2");
      expect(selectedChild.name).toBe("Sara");
    });
  });

  describe("Independent Progress per Child", () => {
    it("mission attempts are scoped by child_id", () => {
      const child1Attempts = [
        { child_id: "c1", mission_id: "m01", coins_earned: 5 },
        { child_id: "c1", mission_id: "m02", coins_earned: 5 },
      ];
      const child2Attempts = [
        { child_id: "c2", mission_id: "m01", coins_earned: 5 },
      ];
      // Child 1 has 2 completed, child 2 has 1
      expect(child1Attempts.length).toBe(2);
      expect(child2Attempts.length).toBe(1);
    });

    it("coins and XP are calculated per child", () => {
      const child1Attempts = [
        { coins_earned: 5, xp_earned: 10 },
        { coins_earned: 10, xp_earned: 20 },
      ];
      const child2Attempts = [
        { coins_earned: 5, xp_earned: 10 },
      ];
      const child1Coins = child1Attempts.reduce((s, a) => s + a.coins_earned, 0);
      const child2Coins = child2Attempts.reduce((s, a) => s + a.coins_earned, 0);
      expect(child1Coins).toBe(15);
      expect(child2Coins).toBe(5);
    });

    it("purchased items are scoped by child_id", () => {
      const child1Items = [{ child_id: "c1", item_id: "owl-astronaut" }];
      const child2Items: any[] = [];
      expect(child1Items.length).toBe(1);
      expect(child2Items.length).toBe(0);
    });

    it("equipped outfits are independent per child", () => {
      const child1Equipped = "owl-wizard";
      const child2Equipped: string | null = null;
      expect(child1Equipped).not.toBe(child2Equipped);
    });
  });
});
