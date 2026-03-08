import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, Check, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shopItems, ShopItem, rarityColors, rarityBgColors } from "@/data/shopItems";
import { toast } from "sonner";

interface CosmeticShopProps {
  childId?: string;
  childName?: string;
  coins: number;
  onCoinsSpent: (amount: number) => void;
  onOutfitChange?: () => void;
}

type CategoryFilter = "all" | "owl-outfit" | "spaceship";

const CosmeticShop = ({ childId, childName, coins, onCoinsSpent }: CosmeticShopProps) => {
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [equippedIds, setEquippedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    if (childId) fetchPurchased();
  }, [childId]);

  const fetchPurchased = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("purchased_items")
      .select("item_id, equipped")
      .eq("child_id", childId!);

    if (data) {
      setPurchasedIds(new Set(data.map((d: any) => d.item_id)));
      setEquippedIds(new Set(data.filter((d: any) => d.equipped).map((d: any) => d.item_id)));
    }
    setLoading(false);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!childId || coins < item.price || purchasedIds.has(item.id)) return;
    setBuyingId(item.id);

    const { error } = await supabase.from("purchased_items").insert({
      child_id: childId,
      item_id: item.id,
      equipped: false,
    });

    if (error) {
      toast.error("Purchase failed");
    } else {
      setPurchasedIds((prev) => new Set([...prev, item.id]));
      onCoinsSpent(item.price);
      toast.success(`${item.name} unlocked! ${item.emoji}`);
      playPurchaseSound();
    }
    setBuyingId(null);
  };

  const handleEquip = async (item: ShopItem) => {
    if (!childId || !purchasedIds.has(item.id)) return;

    const isEquipped = equippedIds.has(item.id);

    // Unequip all same-category items first, then equip this one
    if (!isEquipped) {
      const sameCategory = shopItems.filter((s) => s.category === item.category && equippedIds.has(s.id));
      for (const sc of sameCategory) {
        await supabase
          .from("purchased_items")
          .update({ equipped: false })
          .eq("child_id", childId)
          .eq("item_id", sc.id);
      }
    }

    await supabase
      .from("purchased_items")
      .update({ equipped: !isEquipped })
      .eq("child_id", childId)
      .eq("item_id", item.id);

    if (isEquipped) {
      setEquippedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } else {
      setEquippedIds((prev) => {
        const next = new Set([...prev].filter((id) => {
          const existing = shopItems.find((s) => s.id === id);
          return existing?.category !== item.category;
        }));
        next.add(item.id);
        return next;
      });
    }
  };

  const playPurchaseSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const filtered = category === "all" ? shopItems : shopItems.filter((i) => i.category === category);

  const categories: { id: CategoryFilter; label: string; emoji: string }[] = [
    { id: "all", label: "All", emoji: "✨" },
    { id: "owl-outfit", label: "Owl Outfits", emoji: "🦉" },
    { id: "spaceship", label: "Spaceships", emoji: "🚀" },
  ];

  if (loading) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-accent" />
          <h3 className="font-display text-xl text-foreground">Cosmic Shop</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
          <Coins className="h-4 w-4 text-accent" />
          <span className="font-display text-sm text-accent">{coins}</span>
        </div>
      </div>
      <p className="mb-4 font-body text-sm text-muted-foreground">
        {childName ? `Spend ${childName}'s coins` : "Spend coins"} on cool gear!
      </p>

      {/* Category filter */}
      <div className="mb-4 flex gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 font-body text-xs font-bold transition-all ${
              category === cat.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => {
            const owned = purchasedIds.has(item.id);
            const equipped = equippedIds.has(item.id);
            const canAfford = coins >= item.price;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.03 }}
                className="relative flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all"
                style={{
                  borderColor: owned ? rarityColors[item.rarity] : "hsl(var(--border))",
                  backgroundColor: owned ? rarityBgColors[item.rarity] : undefined,
                }}
              >
                {/* Rarity badge */}
                <span
                  className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 font-body text-[8px] font-bold uppercase"
                  style={{ color: rarityColors[item.rarity], backgroundColor: rarityBgColors[item.rarity] }}
                >
                  {item.rarity}
                </span>

                <span className="text-3xl">{item.emoji}</span>
                <p className="mt-1 font-display text-xs text-foreground">{item.name}</p>
                <p className="mt-0.5 font-body text-[10px] leading-tight text-muted-foreground">
                  {item.description}
                </p>

                {owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className={`mt-2 flex items-center gap-1 rounded-lg px-3 py-1 font-body text-[10px] font-bold transition-all ${
                      equipped
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-primary/20"
                    }`}
                  >
                    {equipped ? (
                      <>
                        <Check className="h-3 w-3" /> Equipped
                      </>
                    ) : (
                      "Equip"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || buyingId === item.id}
                    className={`mt-2 flex items-center gap-1 rounded-lg px-3 py-1 font-body text-[10px] font-bold transition-all ${
                      canAfford
                        ? "bg-accent text-accent-foreground hover:scale-105"
                        : "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    <Coins className="h-3 w-3" />
                    {item.price}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CosmeticShop;
