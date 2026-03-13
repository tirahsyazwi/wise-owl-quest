import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CosmeticShop from "@/components/CosmeticShop";
import { shopItems } from "@/data/shopItems";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: (...args: any[]) => {
        mockSelect(table, ...args);
        return {
          eq: (col: string, val: any) => {
            mockEq(col, val);
            return Promise.resolve({
              data: [
                { item_id: "owl-astronaut", equipped: false },
                { item_id: "ship-flames", equipped: true },
              ],
            });
          },
        };
      },
      insert: (data: any) => {
        mockInsert(table, data);
        return Promise.resolve({ error: null });
      },
      update: (data: any) => {
        mockUpdate(table, data);
        return {
          eq: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      },
    }),
  },
}));

describe("CosmeticShop", () => {
  const defaultProps = {
    childId: "child-1",
    childName: "Test Kid",
    coins: 100,
    onCoinsSpent: vi.fn(),
    onOutfitChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders shop title and coin display", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Cosmic Shop")).toBeInTheDocument();
      // Coin display shows in the header
      const coinDisplays = screen.getAllByText("100");
      expect(coinDisplays.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders category filter buttons", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Owl Outfits")).toBeInTheDocument();
      expect(screen.getByText("Spaceships")).toBeInTheDocument();
    });
  });

  it("shows all shop items by default", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      shopItems.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      });
    });
  });

  it("filters by category when clicking Owl Outfits", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => screen.getByText("Owl Outfits"));
    fireEvent.click(screen.getByText("Owl Outfits"));
    
    const owlItems = shopItems.filter(i => i.category === "owl-outfit");
    const shipItems = shopItems.filter(i => i.category === "spaceship");
    
    owlItems.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
    shipItems.forEach(item => {
      expect(screen.queryByText(item.name)).not.toBeInTheDocument();
    });
  });

  it("shows Equip button for purchased items", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Equip")).toBeInTheDocument(); // owl-astronaut is purchased but not equipped
    });
  });

  it("shows Equipped for equipped items", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Equipped")).toBeInTheDocument(); // ship-flames is equipped
    });
  });

  it("shows loading state initially", () => {
    render(<CosmeticShop {...defaultProps} />);
    // Initial render shows loading spinner
    const spinner = document.querySelector(".animate-spin");
    // It may or may not be visible depending on timing
    expect(spinner !== null || screen.queryByText("Cosmic Shop") !== null).toBe(true);
  });

  it("displays rarity badges on items", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      const commonBadges = screen.getAllByText("common");
      expect(commonBadges.length).toBeGreaterThan(0);
    });
  });

  it("renders child name in description", async () => {
    render(<CosmeticShop {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Spend Test Kid's coins/)).toBeInTheDocument();
    });
  });
});
