import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Crown, Rocket, Calendar, CreditCard, XCircle, Check, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_DETAILS, PlanType } from "@/hooks/useSubscription";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { subscription, isActive, isPaid, daysLeft, cancelPlan, selectPlan, loading } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [switching, setSwitching] = useState<PlanType | null>(null);

  if (loading) {
    return (
      <div className="star-field flex min-h-screen items-center justify-center bg-background">
        <Star className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const currentPlan = subscription?.plan || "trial";
  const detail = PLAN_DETAILS[currentPlan];

  const handleCancel = async () => {
    setCanceling(true);
    await cancelPlan();
    toast.success("Subscription canceled");
    setCanceling(false);
  };

  const handleSwitch = async (plan: PlanType) => {
    setSwitching(plan);
    await selectPlan(plan);
    toast.success(`Switched to ${PLAN_DETAILS[plan].name}!`);
    setSwitching(null);
  };

  const otherPlans = (["trial", "monthly", "yearly"] as PlanType[]).filter((p) => p !== currentPlan);

  const statusColor = subscription?.status === "active" ? "text-primary" : subscription?.status === "canceled" ? "text-destructive" : "text-muted-foreground";
  const statusLabel = subscription?.status === "active" ? "Active" : subscription?.status === "canceled" ? "Canceled" : "Expired";

  return (
    <div className="star-field flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl text-foreground">Settings</h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-6">

          {/* Current Plan Card */}
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/20 p-2">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg text-foreground">{detail.name}</h2>
                  <p className="font-body text-xs text-muted-foreground">
                    {detail.price === 0 ? "Free" : `$${detail.price}/${detail.period}`}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 font-display text-xs ${statusColor} bg-card border border-border`}>
                {statusLabel}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted p-3">
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Missions</p>
                <p className="font-display text-lg text-foreground">
                  {detail.missions === -1 ? "Unlimited" : detail.missions}
                </p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Children</p>
                <p className="font-display text-lg text-foreground">{detail.children}</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Started</p>
                <p className="font-display text-sm text-foreground">
                  {subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">
                  {isActive ? "Expires" : "Expired"}
                </p>
                <p className="font-display text-sm text-foreground">
                  {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "—"}
                  {isActive && daysLeft <= 7 && (
                    <span className="ml-1 text-xs text-accent">({daysLeft}d left)</span>
                  )}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {detail.features.map((f) => (
                <li key={f} className="flex items-center gap-2 font-body text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive && subscription?.status === "active" && (
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-2.5 font-display text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {canceling ? "Canceling..." : "Cancel Subscription"}
              </button>
            )}
          </div>

          {/* Switch Plan */}
          <div>
            <h3 className="mb-3 font-display text-base text-foreground">Switch Plan</h3>
            <div className="space-y-3">
              {otherPlans.map((plan) => {
                const d = PLAN_DETAILS[plan];
                return (
                  <motion.button
                    key={plan}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleSwitch(plan)}
                    disabled={switching !== null}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-1.5 ${plan === "yearly" ? "bg-accent/20" : "bg-primary/20"}`}>
                        {plan === "yearly" ? <Crown className="h-4 w-4 text-accent" /> : plan === "monthly" ? <Rocket className="h-4 w-4 text-primary" /> : <Star className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="text-left">
                        <p className="font-display text-sm text-foreground">{d.name}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {d.price === 0 ? "Free • 7 days" : `$${d.price}/${d.period}`}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-primary/10 px-3 py-1 font-display text-xs text-primary">
                      {switching === plan ? "..." : "Switch"}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Account */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-3 font-display text-base text-foreground">Account</h3>
            <p className="font-body text-sm text-muted-foreground">{user?.email}</p>
            <button
              onClick={async () => { await signOut(); navigate("/"); }}
              className="mt-4 w-full rounded-xl border border-border py-2.5 font-display text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
