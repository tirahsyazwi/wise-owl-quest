import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Star, Rocket, Crown, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_DETAILS, PlanType } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const icons: Record<PlanType, React.ElementType> = { trial: Star, monthly: Rocket, yearly: Crown };
const accents: Record<PlanType, string> = {
  trial: "border-muted-foreground/30",
  monthly: "border-primary ring-2 ring-primary/20",
  yearly: "border-accent ring-2 ring-accent/20",
};

const PricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription, selectPlan, loading, isExpired } = useSubscription();
  const [selecting, setSelecting] = useState<PlanType | null>(null);

  const handleSelect = async (plan: PlanType) => {
    if (!user) { navigate("/signup"); return; }
    setSelecting(plan);
    try {
      if (plan === "trial") {
        // Trial is always free, no payment needed
        await selectPlan(plan);
        toast.success(`🎉 ${PLAN_DETAILS[plan].name} activated!`);
        navigate("/dashboard");
      } else {
        // Paid plan — create Bayarcash checkout
        const amount = PLAN_DETAILS[plan].price;
        const { data, error } = await supabase.functions.invoke("bayarcash-checkout", {
          body: {
            plan,
            amount: amount.toFixed(2),
            payer_name: user.user_metadata?.display_name || user.email,
            payer_email: user.email,
            user_id: user.id,
            return_url: `${window.location.origin}/pricing?payment=complete&plan=${plan}`,
          },
        });

        if (error || !data?.success) {
          // Fallback: activate locally if Bayarcash is not configured yet
          console.warn("Bayarcash unavailable, activating locally:", error || data?.error);
          await selectPlan(plan);
          toast.success(`🎉 ${PLAN_DETAILS[plan].name} activated!`);
          navigate("/dashboard");
        } else if (data.checkout_url) {
          // Save payment record before redirect
          await supabase.from("payments").insert({
            user_id: user.id,
            plan,
            amount_cents: Math.round(amount * 100),
            currency: "MYR",
            status: "pending",
            bayarcash_payment_intent_id: data.payment_intent_id,
          });
          // Redirect to Bayarcash checkout
          window.location.href = data.checkout_url;
          return;
        }
      }
    } catch {
      // Fallback for any errors
      await selectPlan(plan);
      toast.success(`🎉 ${PLAN_DETAILS[plan].name} activated!`);
      navigate("/dashboard");
    }
    setSelecting(null);
  };

  const plans: PlanType[] = ["trial", "monthly", "yearly"];

  return (
    <div className="star-field flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 px-6 py-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Star className="h-6 w-6 text-accent" />
        <h1 className="font-display text-xl text-foreground">SparkMind Plans</h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="font-display text-3xl text-foreground">
            Choose Your <span className="text-primary">Adventure</span>
          </h2>
          <p className="mt-2 font-body text-muted-foreground">Unlock the full SparkMind experience</p>
        </motion.div>

        {isExpired && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center">
            <p className="font-display text-sm text-destructive">Your plan has expired!</p>
            <p className="font-body text-xs text-muted-foreground">Choose a plan below to continue your adventure.</p>
          </motion.div>
        )}
        <div className="mt-10 grid w-full max-w-4xl gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const detail = PLAN_DETAILS[plan];
            const Icon = icons[plan];
            const isCurrent = subscription?.plan === plan && subscription?.status === "active";
            const isPopular = plan === "yearly";

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border-2 bg-card p-6 ${accents[plan]} transition-transform hover:scale-[1.02]`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 font-display text-xs text-accent-foreground">
                    <Sparkles className="mr-1 inline h-3 w-3" /> Best Value
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${plan === "yearly" ? "bg-accent/20" : "bg-primary/20"}`}>
                    <Icon className={`h-6 w-6 ${plan === "yearly" ? "text-accent" : "text-primary"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">{detail.name}</h3>
                    <p className="font-body text-xs text-muted-foreground">
                      {plan === "trial" ? "No credit card needed" : `Billed ${detail.period}ly`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl text-foreground">
                    {detail.price === 0 ? "Free" : `$${detail.price}`}
                  </span>
                  {detail.price > 0 && (
                    <span className="font-body text-sm text-muted-foreground">/{detail.period}</span>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {detail.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 font-body text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent || selecting !== null}
                  className={`mt-6 w-full rounded-xl py-3 font-display text-sm transition-all ${
                    isCurrent
                      ? "bg-muted text-muted-foreground cursor-default"
                      : plan === "yearly"
                      ? "bg-accent text-accent-foreground hover:brightness-110"
                      : "bg-primary text-primary-foreground hover:brightness-110"
                  } disabled:opacity-60`}
                >
                  {isCurrent ? "Current Plan" : selecting === plan ? "Activating..." : plan === "trial" ? "Start Free Trial" : "Get Started"}
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 max-w-md text-center font-body text-xs text-muted-foreground">
          No real payments — this is a demo. Plans activate instantly.
        </p>
      </main>
    </div>
  );
};

export default PricingPage;
