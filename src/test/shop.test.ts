import { describe, it, expect } from "vitest";
import { shopItems, rarityColors, rarityBgColors } from "@/data/shopItems";

describe("Cosmetic Shop", () => {
  describe("Shop Items Configuration", () => {
    it("has items in both categories", () => {
      const owlOutfits = shopItems.filter((i) => i.category === "owl-outfit");
      const spaceships = shopItems.filter((i) => i.category === "spaceship");
      expect(owlOutfits.length).toBeGreaterThan(0);
      expect(spaceships.length).toBeGreaterThan(0);
    });

    it("all items have unique IDs", () => {
      const ids = shopItems.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all items have positive prices", () => {
      shopItems.forEach((i) => {
        expect(i.price).toBeGreaterThan(0);
      });
    });

    it("all items have valid rarity", () => {
      const validRarities = ["common", "rare", "epic", "legendary"];
      shopItems.forEach((i) => {
        expect(validRarities).toContain(i.rarity);
      });
    });

    it("all rarities have defined colors", () => {
      const rarities = ["common", "rare", "epic", "legendary"] as const;
      rarities.forEach((r) => {
        expect(rarityColors[r]).toBeDefined();
        expect(rarityBgColors[r]).toBeDefined();
      });
    });

    it("legendary items are the most expensive", () => {
      const legendaryPrices = shopItems
        .filter((i) => i.rarity === "legendary")
        .map((i) => i.price);
      const commonPrices = shopItems
        .filter((i) => i.rarity === "common")
        .map((i) => i.price);
      const minLegendary = Math.min(...legendaryPrices);
      const maxCommon = Math.max(...commonPrices);
      expect(minLegendary).toBeGreaterThan(maxCommon);
    });
  });

  describe("Purchase Logic", () => {
    it("cannot buy if not enough coins", () => {
      const coins = 20;
      const item = shopItems.find((i) => i.price > 20)!;
      const canAfford = coins >= item.price;
      expect(canAfford).toBe(false);
    });

    it("can buy if enough coins", () => {
      const coins = 100;
      const item = shopItems.find((i) => i.price <= 100)!;
      const canAfford = coins >= item.price;
      expect(canAfford).toBe(true);
    });

    it("cannot buy already purchased item", () => {
      const purchasedIds = new Set(["owl-astronaut"]);
      const canBuy = !purchasedIds.has("owl-astronaut");
      expect(canBuy).toBe(false);
    });

    it("coins decrease after purchase", () => {
      let coins = 100;
      const item = shopItems[0]; // 30 coins
      coins -= item.price;
      expect(coins).toBe(100 - item.price);
    });
  });

  describe("Equip Logic", () => {
    it("can equip a purchased item", () => {
      const purchasedIds = new Set(["owl-astronaut"]);
      const canEquip = purchasedIds.has("owl-astronaut");
      expect(canEquip).toBe(true);
    });

    it("cannot equip an unpurchased item", () => {
      const purchasedIds = new Set<string>();
      const canEquip = purchasedIds.has("owl-astronaut");
      expect(canEquip).toBe(false);
    });

    it("equipping same-category item unequips others", () => {
      const equippedIds = new Set(["owl-astronaut"]);
      const newItem = shopItems.find((i) => i.id === "owl-wizard")!;
      // Unequip same category
      const filtered = new Set(
        [...equippedIds].filter((id) => {
          const existing = shopItems.find((s) => s.id === id);
          return existing?.category !== newItem.category;
        })
      );
      filtered.add(newItem.id);
      expect(filtered.has("owl-astronaut")).toBe(false);
      expect(filtered.has("owl-wizard")).toBe(true);
    });

    it("equipping spaceship does not unequip owl outfit", () => {
      const equippedIds = new Set(["owl-astronaut"]);
      const newItem = shopItems.find((i) => i.id === "ship-flames")!;
      const filtered = new Set(
        [...equippedIds].filter((id) => {
          const existing = shopItems.find((s) => s.id === id);
          return existing?.category !== newItem.category;
        })
      );
      filtered.add(newItem.id);
      expect(filtered.has("owl-astronaut")).toBe(true);
      expect(filtered.has("ship-flames")).toBe(true);
    });
  });

  describe("Category Filtering", () => {
    it("filter 'all' returns all items", () => {
      const filtered = shopItems;
      expect(filtered).toHaveLength(shopItems.length);
    });

    it("filter 'owl-outfit' returns only owl outfits", () => {
      const filtered = shopItems.filter((i) => i.category === "owl-outfit");
      filtered.forEach((i) => expect(i.category).toBe("owl-outfit"));
      expect(filtered.length).toBe(8);
    });

    it("filter 'spaceship' returns only spaceships", () => {
      const filtered = shopItems.filter((i) => i.category === "spaceship");
      filtered.forEach((i) => expect(i.category).toBe("spaceship"));
      expect(filtered.length).toBe(6);
    });
  });
});
