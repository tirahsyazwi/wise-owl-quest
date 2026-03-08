import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PlanType = "trial" | "monthly" | "yearly";
export type PlanStatus = "active" | "expired" | "canceled";

export interface Subscription {
  id: string;
  plan: PlanType;
  status: PlanStatus;
  started_at: string;
  expires_at: string;
}

export const PLAN_DETAILS = {
  trial: { name: "Free Trial", price: 0, period: "7 days", missions: 5, children: 1, features: ["5 starter missions", "1 child profile", "Basic progress view"] },
  monthly: { name: "Explorer", price: 9.99, period: "month", missions: -1, children: 3, features: ["Unlimited missions", "Up to 3 child profiles", "Full progress reports", "Cosmetic shop access", "All achievement badges"] },
  yearly: { name: "Galaxy Pass", price: 79.99, period: "year", missions: -1, children: 5, features: ["Everything in Explorer", "Up to 5 child profiles", "Priority new missions", "Exclusive cosmetics", "Save 33% vs monthly"] },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSubscription();
    else { setSubscription(null); setLoading(false); }
  }, [user]);

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setSubscription({
        id: data.id,
        plan: data.plan as PlanType,
        status: data.status as PlanStatus,
        started_at: data.started_at,
        expires_at: data.expires_at,
      });
    }
    setLoading(false);
  };

  const isActive = subscription?.status === "active" && new Date(subscription.expires_at) > new Date();
  const isExpired = subscription !== null && !isActive;
  const isPaid = isActive && subscription?.plan !== "trial";
  const daysLeft = subscription?.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : 0;

  const currentPlan = subscription?.plan || "trial";
  const limits = PLAN_DETAILS[currentPlan];
  const maxMissions = limits.missions; // -1 = unlimited
  const maxChildren = limits.children;

  const selectPlan = async (plan: PlanType) => {
    if (!user) return;
    const durations: Record<PlanType, string> = {
      trial: "7 days",
      monthly: "1 month",
      yearly: "1 year",
    };

    if (subscription) {
      await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + parseDuration(durations[plan])).toISOString(),
        })
        .eq("id", subscription.id);
    } else {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan,
        status: "active",
        expires_at: new Date(Date.now() + parseDuration(durations[plan])).toISOString(),
      });
    }
    await fetchSubscription();
  };

  const cancelPlan = async () => {
    if (!subscription) return;
    await supabase
      .from("subscriptions")
      .update({ status: "canceled" as any })
      .eq("id", subscription.id);
    await fetchSubscription();
  };

  return { subscription, loading, isActive, isPaid, daysLeft, maxMissions, maxChildren, selectPlan, cancelPlan, refetch: fetchSubscription };
};

function parseDuration(d: string): number {
  if (d === "7 days") return 7 * 86400000;
  if (d === "1 month") return 30 * 86400000;
  if (d === "1 year") return 365 * 86400000;
  return 0;
}
