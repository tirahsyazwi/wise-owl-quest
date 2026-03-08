import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { shopItems } from "@/data/shopItems";

export const useEquippedOutfit = (childId?: string) => {
  const [equippedOutfitId, setEquippedOutfitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) fetchEquipped();
    else { setEquippedOutfitId(null); setLoading(false); }
  }, [childId]);

  const fetchEquipped = async () => {
    const { data } = await supabase
      .from("purchased_items")
      .select("item_id")
      .eq("child_id", childId!)
      .eq("equipped", true);

    if (data) {
      const outfitItem = data.find((d: any) => {
        const item = shopItems.find((s) => s.id === d.item_id);
        return item?.category === "owl-outfit";
      });
      setEquippedOutfitId(outfitItem?.item_id || null);
    }
    setLoading(false);
  };

  return { equippedOutfitId, loading, refetch: fetchEquipped };
};
