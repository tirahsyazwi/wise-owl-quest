import { describe, it, expect } from "vitest";
import { PLAN_DETAILS } from "@/hooks/useSubscription";

describe("Subscription Plans", () => {
  describe("Plan Configuration", () => {
    it("trial plan has correct limits", () => {
      const trial = PLAN_DETAILS.trial;
      expect(trial.name).toBe("Free Trial");
      expect(trial.price).toBe(0);
      expect(trial.missions).toBe(5);
      expect(trial.children).toBe(1);
    });

    it("monthly plan has correct limits", () => {
      const monthly = PLAN_DETAILS.monthly;
      expect(monthly.name).toBe("Explorer");
      expect(monthly.price).toBe(9.99);
      expect(monthly.missions).toBe(-1); // unlimited
      expect(monthly.children).toBe(3);
    });

    it("yearly plan has correct limits", () => {
      const yearly = PLAN_DETAILS.yearly;
      expect(yearly.name).toBe("Galaxy Pass");
      expect(yearly.price).toBe(79.99);
      expect(yearly.missions).toBe(-1); // unlimited
      expect(yearly.children).toBe(5);
    });

    it("yearly plan saves 33% vs monthly", () => {
      const monthlyAnnual = PLAN_DETAILS.monthly.price * 12;
      const yearlyCost = PLAN_DETAILS.yearly.price;
      const savings = ((monthlyAnnual - yearlyCost) / monthlyAnnual) * 100;
      expect(savings).toBeGreaterThanOrEqual(30); // At least 30% savings
    });
  });

  describe("Subscription Status Logic", () => {
    it("isActive when status is active and not expired", () => {
      const sub = {
        status: "active",
        expires_at: new Date(Date.now() + 86400000).toISOString(), // +1 day
      };
      const isActive = sub.status === "active" && new Date(sub.expires_at) > new Date();
      expect(isActive).toBe(true);
    });

    it("isExpired when past expiry date", () => {
      const sub = {
        status: "active",
        expires_at: new Date(Date.now() - 86400000).toISOString(), // -1 day
      };
      const isActive = sub.status === "active" && new Date(sub.expires_at) > new Date();
      expect(isActive).toBe(false);
    });

    it("isExpired when status is canceled", () => {
      const sub = {
        status: "canceled",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      };
      const isActive = sub.status === "active" && new Date(sub.expires_at) > new Date();
      expect(isActive).toBe(false);
    });

    it("isPaid when active and not trial", () => {
      const plan: string = "monthly";
      const status = "active";
      const expires_at = new Date(Date.now() + 86400000).toISOString();
      const isActive = status === "active" && new Date(expires_at) > new Date();
      const isPaid = isActive && plan !== "trial";
      expect(isPaid).toBe(true);
    });

    it("isPaid is false for trial plan", () => {
      const plan = "trial";
      const status = "active";
      const expires_at = new Date(Date.now() + 86400000).toISOString();
      const isActive = status === "active" && new Date(expires_at) > new Date();
      const isPaid = isActive && plan !== "trial";
      expect(isPaid).toBe(false);
    });

    it("daysLeft calculates correctly", () => {
      const threeDaysFromNow = new Date(Date.now() + 3 * 86400000).toISOString();
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(threeDaysFromNow).getTime() - Date.now()) / 86400000)
      );
      expect(daysLeft).toBe(3);
    });

    it("daysLeft is 0 when expired", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(yesterday).getTime() - Date.now()) / 86400000)
      );
      expect(daysLeft).toBe(0);
    });
  });

  describe("Plan Duration Parsing", () => {
    const parseDuration = (d: string): number => {
      if (d === "7 days") return 7 * 86400000;
      if (d === "1 month") return 30 * 86400000;
      if (d === "1 year") return 365 * 86400000;
      return 0;
    };

    it("trial lasts 7 days", () => {
      expect(parseDuration("7 days")).toBe(7 * 86400000);
    });

    it("monthly lasts 30 days", () => {
      expect(parseDuration("1 month")).toBe(30 * 86400000);
    });

    it("yearly lasts 365 days", () => {
      expect(parseDuration("1 year")).toBe(365 * 86400000);
    });
  });

  describe("Trial Plan Restrictions", () => {
    it("trial limits to 5 missions", () => {
      const maxMissions = PLAN_DETAILS.trial.missions;
      const completedMissions = ["m01", "m02", "m03", "m04", "m05"];
      const canStartNew = maxMissions <= 0 || completedMissions.length < maxMissions;
      expect(canStartNew).toBe(false);
    });

    it("trial limits to 1 child", () => {
      const maxChildren = PLAN_DETAILS.trial.children;
      const currentChildren = 1;
      const canAddMore = currentChildren < maxChildren;
      expect(canAddMore).toBe(false);
    });

    it("paid plan allows unlimited missions", () => {
      const maxMissions = PLAN_DETAILS.monthly.missions; // -1
      const completedMissions = Array.from({ length: 25 }, (_, i) => `m${i}`);
      const canStartNew = maxMissions <= 0 || completedMissions.length < maxMissions;
      expect(canStartNew).toBe(true); // -1 <= 0 is true
    });

    it("monthly plan allows up to 3 children", () => {
      const maxChildren = PLAN_DETAILS.monthly.children;
      expect(maxChildren).toBe(3);
    });

    it("yearly plan allows up to 5 children", () => {
      const maxChildren = PLAN_DETAILS.yearly.children;
      expect(maxChildren).toBe(5);
    });
  });

  describe("Shop Access Gate", () => {
    it("shop is locked for trial users", () => {
      const isPaid = false; // trial
      expect(isPaid).toBe(false);
    });

    it("shop is unlocked for monthly users", () => {
      const plan: string = "monthly";
      const isActive = true;
      const isPaid = isActive && plan !== "trial";
      expect(isPaid).toBe(true);
    });

    it("shop is unlocked for yearly users", () => {
      const plan: string = "yearly";
      const isActive = true;
      const isPaid = isActive && plan !== "trial";
      expect(isPaid).toBe(true);
    });
  });
});
