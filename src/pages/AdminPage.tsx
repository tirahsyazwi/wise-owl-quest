import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Star,
  BarChart3,
  Trophy,
  Shield,
  TrendingUp,
  Activity,
  CreditCard,
  UserCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Crown,
  Rocket,
  Coins,
  Gamepad2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { missionBank } from "@/data/missionBank";
import { achievements, AchievementStats } from "@/data/achievements";
import { shopItems } from "@/data/shopItems";

// ── Types ──
interface UserRow {
  user_id: string;
  display_name: string | null;
  created_at: string;
}

interface SubscriptionRow {
  user_id: string;
  plan: string;
  status: string;
  expires_at: string;
}

interface ChildRow {
  id: string;
  name: string;
  age: number;
  avatar: string;
  parent_id: string;
  created_at: string;
}

interface AttemptRow {
  mission_id: string;
  mission_type: string;
  difficulty: number;
  attempts: number;
  hints_used: number;
  solve_time_seconds: number | null;
  coins_earned: number;
  xp_earned: number;
  child_id: string;
  parent_id: string;
  created_at: string;
}

interface PaymentRow {
  id: string;
  user_id: string;
  plan: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

interface PurchaseRow {
  child_id: string;
  item_id: string;
  equipped: boolean;
}

type AdminTab = "overview" | "users" | "missions" | "revenue" | "engagement";

// ── Stats Computation ──
const computeStats = (attempts: AttemptRow[]): AchievementStats => {
  const completedIds = new Set(attempts.map(a => a.mission_id));
  const byType = (type: string) =>
    new Set(attempts.filter(a => a.mission_type === type).map(a => a.mission_id)).size;
  return {
    totalCompleted: completedIds.size,
    totalCoins: attempts.reduce((s, a) => s + a.coins_earned, 0),
    totalXp: attempts.reduce((s, a) => s + a.xp_earned, 0),
    perfectMissions: attempts.filter(a => a.attempts === 1 && a.hints_used === 0).length,
    hintsUsed: attempts.reduce((s, a) => s + a.hints_used, 0),
    totalAttempts: attempts.reduce((s, a) => s + a.attempts, 0),
    zonesCleared: 0,
    patternCompleted: byType("pattern"),
    logicCompleted: byType("logic"),
    strategyCompleted: byType("strategy"),
    planningCompleted: byType("planning"),
    spatialCompleted: byType("spatial"),
    sequenceCompleted: byType("sequence"),
    hardCompleted: new Set(attempts.filter(a => a.difficulty >= 4).map(a => a.mission_id)).size,
    fastSolves: attempts.filter(a => a.solve_time_seconds != null && a.solve_time_seconds < 30).length,
    maxDifficulty: Math.max(0, ...attempts.map(a => a.difficulty)),
  };
};

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [profiles, setProfiles] = useState<UserRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) fetchAll();
  }, [user, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    const [profilesRes, subsRes, childrenRes, attemptsRes, paymentsRes, purchasesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, created_at"),
      supabase.from("subscriptions").select("user_id, plan, status, expires_at"),
      supabase.from("children").select("*"),
      supabase.from("mission_attempts").select("*").eq("completed", true),
      supabase.from("payments").select("*"),
      supabase.from("purchased_items").select("child_id, item_id, equipped"),
    ]);
    setProfiles((profilesRes.data as UserRow[]) || []);
    setSubscriptions((subsRes.data as SubscriptionRow[]) || []);
    setChildren((childrenRes.data as ChildRow[]) || []);
    setAttempts((attemptsRes.data as AttemptRow[]) || []);
    setPayments((paymentsRes.data as PaymentRow[]) || []);
    setPurchases((purchasesRes.data as PurchaseRow[]) || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="star-field flex min-h-screen items-center justify-center bg-background">
        <Star className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // ── Computed Stats ──
  const totalUsers = profiles.length;
  const activeSubs = subscriptions.filter(s => s.status === "active" && new Date(s.expires_at) > new Date());
  const planCounts = { trial: 0, monthly: 0, yearly: 0 };
  activeSubs.forEach(s => { if (s.plan in planCounts) planCounts[s.plan as keyof typeof planCounts]++; });

  const totalChildren = children.length;
  const totalAttempts = attempts.length;
  const totalCoinsEarned = attempts.reduce((s, a) => s + a.coins_earned, 0);
  const totalXpEarned = attempts.reduce((s, a) => s + a.xp_earned, 0);
  const uniqueMissionsCompleted = new Set(attempts.map(a => a.mission_id)).size;
  const avgAttemptsPerMission = totalAttempts > 0 ? (attempts.reduce((s, a) => s + a.attempts, 0) / totalAttempts).toFixed(1) : "0";

  // Mission popularity
  const missionPopularity: Record<string, number> = {};
  attempts.forEach(a => { missionPopularity[a.mission_id] = (missionPopularity[a.mission_id] || 0) + 1; });
  const sortedMissions = Object.entries(missionPopularity).sort((a, b) => b[1] - a[1]);

  // Revenue stats
  const totalRevenue = payments.filter(p => p.status === "paid" || p.status === "success").reduce((s, p) => s + p.amount_cents, 0) / 100;
  const pendingRevenue = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0) / 100;

  // Type distribution
  const typeDistribution: Record<string, number> = {};
  attempts.forEach(a => { typeDistribution[a.mission_type] = (typeDistribution[a.mission_type] || 0) + 1; });

  // Difficulty distribution
  const difficultyDistribution: Record<number, number> = {};
  attempts.forEach(a => { difficultyDistribution[a.difficulty] = (difficultyDistribution[a.difficulty] || 0) + 1; });

  // Shop stats
  const totalPurchases = purchases.length;
  const itemPopularity: Record<string, number> = {};
  purchases.forEach(p => { itemPopularity[p.item_id] = (itemPopularity[p.item_id] || 0) + 1; });
  const sortedItems = Object.entries(itemPopularity).sort((a, b) => b[1] - a[1]);

  // Avg solve time
  const solveTimes = attempts.filter(a => a.solve_time_seconds != null).map(a => a.solve_time_seconds!);
  const avgSolveTime = solveTimes.length > 0 ? Math.round(solveTimes.reduce((s, t) => s + t, 0) / solveTimes.length) : 0;

  // Weekly active users (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weeklyActiveParents = new Set(attempts.filter(a => new Date(a.created_at) >= weekAgo).map(a => a.parent_id)).size;

  // Filtered users for search
  const filteredProfiles = searchQuery
    ? profiles.filter(p => (p.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : profiles;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "missions", label: "Missions", icon: Gamepad2 },
    { id: "revenue", label: "Revenue", icon: CreditCard },
    { id: "engagement", label: "Engagement", icon: Activity },
  ];

  return (
    <div className="star-field flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl text-foreground">Admin Dashboard</h1>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-body text-xs font-bold transition-all ${
              tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total Users", value: totalUsers, icon: Users, color: "text-primary" },
                  { label: "Active Subs", value: activeSubs.length, icon: Crown, color: "text-accent" },
                  { label: "Children", value: totalChildren, icon: UserCircle, color: "text-cosmic-purple" },
                  { label: "Weekly Active", value: weeklyActiveParents, icon: Activity, color: "text-cosmic-green" },
                  { label: "Missions Done", value: totalAttempts, icon: Gamepad2, color: "text-cosmic-orange" },
                  { label: "Avg Attempts", value: avgAttemptsPerMission, icon: TrendingUp, color: "text-cosmic-pink" },
                  { label: "Total Coins", value: totalCoinsEarned, icon: Coins, color: "text-accent" },
                  { label: "Total XP", value: totalXpEarned, icon: Star, color: "text-primary" },
                ].map(kpi => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card p-4 text-center"
                  >
                    <kpi.icon className={`mx-auto mb-1 h-5 w-5 ${kpi.color}`} />
                    <p className={`font-display text-2xl ${kpi.color}`}>{kpi.value}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{kpi.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Plan Distribution */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Plan Distribution</h3>
                <div className="flex gap-4">
                  {Object.entries(planCounts).map(([plan, count]) => {
                    const percent = activeSubs.length > 0 ? Math.round((count / activeSubs.length) * 100) : 0;
                    const colors: Record<string, string> = { trial: "bg-muted-foreground", monthly: "bg-primary", yearly: "bg-accent" };
                    return (
                      <div key={plan} className="flex-1">
                        <div className="mb-1 flex justify-between">
                          <span className="font-body text-xs capitalize text-foreground">{plan}</span>
                          <span className="font-body text-xs text-muted-foreground">{count} ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${colors[plan]}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-2 font-display text-sm text-foreground">Avg Solve Time</h3>
                  <p className="font-display text-3xl text-primary">{avgSolveTime}s</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-2 font-display text-sm text-foreground">Missions Covered</h3>
                  <p className="font-display text-3xl text-accent">{uniqueMissionsCompleted}/{missionBank.length}</p>
                </div>
              </div>
            </>
          )}

          {/* ── USERS TAB ── */}
          {tab === "users" && (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                {filteredProfiles.map(profile => {
                  const sub = subscriptions.find(s => s.user_id === profile.user_id);
                  const userChildren = children.filter(c => c.parent_id === profile.user_id);
                  const userAttempts = attempts.filter(a => a.parent_id === profile.user_id);
                  const isExpanded = expandedUser === profile.user_id;
                  const isActive = sub && sub.status === "active" && new Date(sub.expires_at) > new Date();

                  return (
                    <motion.div
                      key={profile.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : profile.user_id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-display text-sm text-foreground">{profile.display_name || "Anonymous"}</p>
                            <p className="font-body text-[10px] text-muted-foreground">
                              Joined {new Date(profile.created_at).toLocaleDateString()} • {userChildren.length} child{userChildren.length !== 1 ? "ren" : ""} • {userAttempts.length} missions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 font-body text-[10px] font-bold ${
                            isActive ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                          }`}>
                            {sub?.plan || "none"} • {isActive ? "active" : sub?.status || "none"}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border px-4 py-3 space-y-3">
                          {/* Children */}
                          <div>
                            <p className="mb-1 font-body text-xs font-bold text-muted-foreground">Children</p>
                            {userChildren.length === 0 ? (
                              <p className="font-body text-xs text-muted-foreground">No children added</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {userChildren.map(child => {
                                  const childAttempts = attempts.filter(a => a.child_id === child.id);
                                  const childCoins = childAttempts.reduce((s, a) => s + a.coins_earned, 0);
                                  const childPurchases = purchases.filter(p => p.child_id === child.id);
                                  return (
                                    <div key={child.id} className="rounded-lg bg-muted p-2 text-xs">
                                      <p className="font-display text-foreground">{child.name} (age {child.age})</p>
                                      <p className="font-body text-muted-foreground">
                                        {childAttempts.length} missions • {childCoins} coins • {childPurchases.length} items
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Progress Summary */}
                          {userAttempts.length > 0 && (
                            <div>
                              <p className="mb-1 font-body text-xs font-bold text-muted-foreground">Progress</p>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="rounded-lg bg-muted p-2 text-center">
                                  <p className="font-display text-sm text-primary">{userAttempts.length}</p>
                                  <p className="font-body text-[9px] text-muted-foreground">Missions</p>
                                </div>
                                <div className="rounded-lg bg-muted p-2 text-center">
                                  <p className="font-display text-sm text-accent">{userAttempts.reduce((s, a) => s + a.coins_earned, 0)}</p>
                                  <p className="font-body text-[9px] text-muted-foreground">Coins</p>
                                </div>
                                <div className="rounded-lg bg-muted p-2 text-center">
                                  <p className="font-display text-sm text-cosmic-green">{userAttempts.reduce((s, a) => s + a.xp_earned, 0)}</p>
                                  <p className="font-body text-[9px] text-muted-foreground">XP</p>
                                </div>
                                <div className="rounded-lg bg-muted p-2 text-center">
                                  <p className="font-display text-sm text-cosmic-purple">
                                    {userAttempts.filter(a => a.attempts === 1 && a.hints_used === 0).length}
                                  </p>
                                  <p className="font-body text-[9px] text-muted-foreground">Perfect</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── MISSIONS TAB ── */}
          {tab === "missions" && (
            <>
              {/* Type Distribution */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Completions by Type</h3>
                <div className="space-y-2">
                  {Object.entries(typeDistribution).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                    const maxCount = Math.max(...Object.values(typeDistribution));
                    const percent = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="mb-0.5 flex justify-between">
                          <span className="font-body text-xs capitalize text-foreground">{type}</span>
                          <span className="font-body text-xs text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Completions by Difficulty</h3>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(d => (
                    <div key={d} className="flex-1 text-center">
                      <div className="mx-auto mb-1 flex h-12 w-full items-end justify-center rounded-lg bg-muted p-1">
                        <div
                          className="w-full rounded bg-primary"
                          style={{
                            height: `${Math.min(100, ((difficultyDistribution[d] || 0) / Math.max(1, ...Object.values(difficultyDistribution))) * 100)}%`,
                            minHeight: difficultyDistribution[d] ? 4 : 0,
                          }}
                        />
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground">Lv.{d}</p>
                      <p className="font-display text-xs text-foreground">{difficultyDistribution[d] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission Popularity */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Most Popular Missions</h3>
                <div className="space-y-2">
                  {sortedMissions.slice(0, 10).map(([missionId, count], i) => {
                    const mission = missionBank.find(m => m.id === missionId);
                    return (
                      <div key={missionId} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xs text-muted-foreground">#{i + 1}</span>
                          <div>
                            <p className="font-display text-xs text-foreground">{mission?.title || missionId}</p>
                            <p className="font-body text-[10px] text-muted-foreground capitalize">{mission?.type} • Lv.{mission?.difficulty}</p>
                          </div>
                        </div>
                        <span className="font-display text-sm text-primary">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── REVENUE TAB ── */}
          {tab === "revenue" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="font-body text-xs text-muted-foreground">Total Revenue</p>
                  <p className="font-display text-3xl text-cosmic-green">MYR {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="font-body text-xs text-muted-foreground">Pending</p>
                  <p className="font-display text-3xl text-accent">MYR {pendingRevenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Payment History</h3>
                {payments.length === 0 ? (
                  <p className="py-4 text-center font-body text-sm text-muted-foreground">No payments recorded</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <div>
                          <p className="font-display text-xs capitalize text-foreground">{p.plan} Plan</p>
                          <p className="font-body text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-sm text-foreground">{p.currency} {(p.amount_cents / 100).toFixed(2)}</p>
                          <p className={`font-body text-[10px] font-bold ${p.status === "paid" || p.status === "success" ? "text-cosmic-green" : "text-accent"}`}>
                            {p.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ENGAGEMENT TAB ── */}
          {tab === "engagement" && (
            <>
              {/* Shop Analytics */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Shop Purchases</h3>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-accent">{totalPurchases}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Total Buys</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-primary">{purchases.filter(p => p.equipped).length}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Equipped</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-cosmic-purple">{new Set(purchases.map(p => p.item_id)).size}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Unique Items</p>
                  </div>
                </div>
                {sortedItems.length > 0 && (
                  <div className="space-y-1.5">
                    {sortedItems.slice(0, 8).map(([itemId, count]) => {
                      const item = shopItems.find(i => i.id === itemId);
                      return (
                        <div key={itemId} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5">
                          <div className="flex items-center gap-2">
                            <span>{item?.emoji || "🎁"}</span>
                            <span className="font-body text-xs text-foreground">{item?.name || itemId}</span>
                          </div>
                          <span className="font-display text-xs text-primary">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Achievement Stats */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Achievement Unlocks (Global)</h3>
                <div className="space-y-1.5">
                  {(() => {
                    // Group attempts by child and compute achievements
                    const childIds = new Set(attempts.map(a => a.child_id));
                    const achievementCounts: Record<string, number> = {};
                    childIds.forEach(cid => {
                      const childAttempts = attempts.filter(a => a.child_id === cid);
                      const stats = computeStats(childAttempts);
                      achievements.forEach(ach => {
                        if (ach.requirement(stats)) {
                          achievementCounts[ach.id] = (achievementCounts[ach.id] || 0) + 1;
                        }
                      });
                    });
                    return Object.entries(achievementCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([achId, count]) => {
                        const ach = achievements.find(a => a.id === achId);
                        return (
                          <div key={achId} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5">
                            <div className="flex items-center gap-2">
                              <span>{ach?.icon || "🏆"}</span>
                              <span className="font-body text-xs text-foreground">{ach?.title || achId}</span>
                            </div>
                            <span className="font-display text-xs text-accent">{count} unlocks</span>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-sm text-foreground">Engagement Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-primary">{avgSolveTime}s</p>
                    <p className="font-body text-[10px] text-muted-foreground">Avg Solve Time</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-accent">
                      {attempts.filter(a => a.attempts === 1 && a.hints_used === 0).length}
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground">Perfect Solves</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-cosmic-purple">
                      {attempts.reduce((s, a) => s + a.hints_used, 0)}
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground">Total Hints Used</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="font-display text-xl text-cosmic-green">{weeklyActiveParents}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Weekly Active</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
