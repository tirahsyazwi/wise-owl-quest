import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Star, Map, Gamepad2, BarChart3, LogOut, Plus, UserCircle, ArrowLeft, Trophy, ShoppingBag, Crown, Settings, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NovaOwl from "@/components/NovaOwl";
import WorldMap from "@/components/WorldMap";
import MissionCard, { MissionResult } from "@/components/MissionCard";
import ParentDashboard from "@/components/ParentDashboard";
import WeeklyProgressReport from "@/components/WeeklyProgressReport";
import RewardBadge from "@/components/RewardBadge";
import AddChildModal from "@/components/AddChildModal";
import CosmeticShop from "@/components/CosmeticShop";
import BadgeCelebration from "@/components/BadgeCelebration";
import AchievementsBoard from "@/components/AchievementsBoard";
import { Mission, missionBank } from "@/data/missionBank";
import { achievements, Achievement, AchievementStats } from "@/data/achievements";

type Tab = "home" | "map" | "mission" | "achievements" | "shop" | "parent";

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

const ZONE_MISSION_COUNTS: Record<string, number> = {
  arrival: 5, foundation: 5, strategic: 5, adaptive: 5, advanced: 5,
};

const computeAchievementStats = (attempts: any[]): AchievementStats => {
  const completedIds = new Set(attempts.map((a: any) => a.mission_id));
  const missionsByZone: Record<string, Set<string>> = {};
  for (const m of missionBank) {
    if (!missionsByZone[m.zone]) missionsByZone[m.zone] = new Set();
    if (completedIds.has(m.id)) missionsByZone[m.zone].add(m.id);
  }
  const zonesCleared = Object.entries(missionsByZone).filter(
    ([zone, ids]) => ids.size >= (ZONE_MISSION_COUNTS[zone] || 5)
  ).length;
  const byType = (type: string) =>
    new Set(attempts.filter((a: any) => a.mission_type === type).map((a: any) => a.mission_id)).size;

  return {
    totalCompleted: completedIds.size,
    totalCoins: attempts.reduce((s: number, a: any) => s + a.coins_earned, 0),
    totalXp: attempts.reduce((s: number, a: any) => s + a.xp_earned, 0),
    perfectMissions: attempts.filter((a: any) => a.attempts === 1 && a.hints_used === 0).length,
    hintsUsed: attempts.reduce((s: number, a: any) => s + a.hints_used, 0),
    totalAttempts: attempts.reduce((s: number, a: any) => s + a.attempts, 0),
    zonesCleared,
    patternCompleted: byType("pattern"),
    logicCompleted: byType("logic"),
    strategyCompleted: byType("strategy"),
    planningCompleted: byType("planning"),
    spatialCompleted: byType("spatial"),
    sequenceCompleted: byType("sequence"),
    hardCompleted: new Set(attempts.filter((a: any) => a.difficulty >= 4).map((a: any) => a.mission_id)).size,
    fastSolves: attempts.filter((a: any) => a.solve_time_seconds !== null && a.solve_time_seconds < 30).length,
    maxDifficulty: Math.max(0, ...attempts.map((a: any) => a.difficulty)),
  };
};

const DashboardPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { subscription, isActive, isPaid, daysLeft, maxMissions, maxChildren } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [celebrationBadge, setCelebrationBadge] = useState<Achievement | null>(null);
  const previousEarnedRef = useRef<Set<string>>(new Set());
  const allAttemptsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedChild) fetchProgress();
  }, [selectedChild]);

  const fetchChildren = async () => {
    const { data, error } = await supabase.from("children").select("*").order("created_at");
    if (error) {
      toast.error("Failed to load children");
    } else {
      setChildren(data || []);
      if (data && data.length > 0 && !selectedChild) setSelectedChild(data[0]);
    }
    setLoadingChildren(false);
  };

  const fetchProgress = async () => {
    if (!selectedChild) return;
    const { data } = await supabase
      .from("mission_attempts")
      .select("mission_id, mission_type, difficulty, attempts, hints_used, solve_time_seconds, coins_earned, xp_earned")
      .eq("child_id", selectedChild.id)
      .eq("completed", true);

    if (data) {
      allAttemptsRef.current = data;
      setCompletedMissions(data.map((d) => d.mission_id));

      // Calculate coins spent on purchases
      const { data: purchases } = await supabase
        .from("purchased_items")
        .select("item_id")
        .eq("child_id", selectedChild.id);

      const earnedCoins = data.reduce((s, d) => s + d.coins_earned, 0);
      // Calculate spent coins from shop items
      const { shopItems } = await import("@/data/shopItems");
      const purchasedIds = new Set((purchases || []).map((p: any) => p.item_id));
      const spentCoins = shopItems.filter((i) => purchasedIds.has(i.id)).reduce((s, i) => s + i.price, 0);

      setTotalCoins(earnedCoins - spentCoins);
      setTotalXp(data.reduce((s, d) => s + d.xp_earned, 0));

      // Track earned achievements for celebration detection
      const stats = computeAchievementStats(data);
      const earnedIds = new Set(achievements.filter((a) => a.requirement(stats)).map((a) => a.id));
      previousEarnedRef.current = earnedIds;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSelectMission = (mission: Mission) => {
    // Gate: check mission limit for trial users
    if (maxMissions > 0 && completedMissions.length >= maxMissions && !completedMissions.includes(mission.id)) {
      toast.error("Mission limit reached! Upgrade your plan to unlock more.", { action: { label: "Upgrade", onClick: () => navigate("/pricing") } });
      return;
    }
    setActiveMission(mission);
    setActiveTab("mission");
  };

  const handleAddChild = () => {
    if (maxChildren > 0 && children.length >= maxChildren) {
      toast.error(`Your plan allows ${maxChildren} child profile${maxChildren > 1 ? "s" : ""}. Upgrade to add more!`, { action: { label: "Upgrade", onClick: () => navigate("/pricing") } });
      return;
    }
    setShowAddChild(true);
  };

  const handleMissionComplete = async (result: MissionResult) => {
    if (!user || !selectedChild) return;

    const { error } = await supabase.from("mission_attempts").insert({
      child_id: selectedChild.id,
      parent_id: user.id,
      mission_id: result.missionId,
      mission_type: result.missionType,
      difficulty: result.difficulty,
      completed: true,
      attempts: result.attempts,
      hints_used: result.hintsUsed,
      solve_time_seconds: result.solveTimeSeconds,
      coins_earned: result.coins,
      xp_earned: result.xp,
    });

    if (error) console.error("Failed to save attempt:", error);

    // Update local state
    const newAttempt = {
      mission_id: result.missionId,
      mission_type: result.missionType,
      difficulty: result.difficulty,
      attempts: result.attempts,
      hints_used: result.hintsUsed,
      solve_time_seconds: result.solveTimeSeconds,
      coins_earned: result.coins,
      xp_earned: result.xp,
    };
    allAttemptsRef.current = [...allAttemptsRef.current, newAttempt];

    setCompletedMissions((prev) => [...prev, result.missionId]);
    setTotalCoins((prev) => prev + result.coins);
    setTotalXp((prev) => prev + result.xp);
    toast.success(`+${result.coins} coins, +${result.xp} XP!`);

    // Check for newly unlocked achievements
    const stats = computeAchievementStats(allAttemptsRef.current);
    const newEarnedIds = new Set(achievements.filter((a) => a.requirement(stats)).map((a) => a.id));
    const newlyUnlocked = achievements.find(
      (a) => newEarnedIds.has(a.id) && !previousEarnedRef.current.has(a.id)
    );
    previousEarnedRef.current = newEarnedIds;

    if (newlyUnlocked) {
      // Small delay so the mission complete toast shows first
      setTimeout(() => setCelebrationBadge(newlyUnlocked), 800);
    }

    setActiveMission(null);
    setActiveTab("map");
  };

  const handleCoinsSpent = (amount: number) => {
    setTotalCoins((prev) => prev - amount);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Rocket },
    { id: "map", label: "Map", icon: Map },
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "achievements", label: "Badges", icon: Trophy },
    { id: "parent", label: "Parent", icon: BarChart3 },
  ];

  if (authLoading || loadingChildren) {
    return (
      <div className="star-field flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Star className="h-8 w-8 text-accent" />
        </motion.div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="star-field flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <NovaOwl size="lg" message="Let's set up your explorer's profile!" />
        <h2 className="mt-6 font-display text-2xl text-foreground">Add Your Child</h2>
        <p className="mt-2 max-w-sm text-center font-body text-sm text-muted-foreground">
          Create a profile for your child to start their thinking adventure.
        </p>
        <button
          onClick={() => setShowAddChild(true)}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-lg transition-transform hover:scale-105"
          style={{ boxShadow: "var(--shadow-glow-teal)" }}
        >
          <Plus className="h-5 w-5" />
          Add Child
        </button>
        <button onClick={handleSignOut} className="mt-4 font-body text-sm text-muted-foreground hover:text-foreground">
          Sign Out
        </button>
        <AddChildModal open={showAddChild} onClose={() => setShowAddChild(false)} onAdded={fetchChildren} />
      </div>
    );
  }

  return (
    <div className="star-field flex min-h-screen flex-col bg-background">
      <header className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-accent" />
          <h1 className="font-display text-xl text-foreground">SparkMind</h1>
        </div>
        <div className="flex items-center gap-3">
          <RewardBadge coins={totalCoins} xp={totalXp} />
          {children.length > 0 && (
            <div className="flex items-center gap-1">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 font-body text-xs font-bold transition-all ${
                    selectedChild?.id === child.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserCircle className="h-4 w-4" />
                  {child.name}
                </button>
              ))}
              <button onClick={handleAddChild} className="rounded-full p-1 text-muted-foreground hover:text-primary">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
          <button onClick={() => navigate("/settings")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={handleSignOut} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {subscription?.plan === "trial" && isActive && (
        <div className="relative z-10 flex items-center justify-between bg-accent/10 px-4 py-2 border-b border-border">
          <p className="font-body text-xs text-accent">
            <Crown className="mr-1 inline h-3 w-3" />
            Trial: {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="rounded-lg bg-accent px-3 py-1 font-display text-xs text-accent-foreground hover:brightness-110"
          >
            Upgrade
          </button>
        </div>
      )}

      <main className="relative z-10 flex flex-1 flex-col items-center overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <NovaOwl size="lg" message={`Welcome back, ${selectedChild?.name}! Ready for today's mission? 🚀`} />
              <h2 className="mt-4 font-display text-3xl leading-tight text-foreground">
                Think. Solve. <span className="text-primary">Explore.</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                {completedMissions.length} of {missionBank.length} missions completed
              </p>
              <button
                onClick={() => setActiveTab("map")}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-lg transition-transform hover:scale-105"
                style={{ boxShadow: "var(--shadow-glow-teal)" }}
              >
                <Rocket className="h-5 w-5" />
                Start Mission
              </button>
            </motion.div>
          )}

          {activeTab === "map" && (
            <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl">
              <h2 className="mb-4 text-center font-display text-2xl text-foreground">Mission Planet</h2>
              <WorldMap completedMissionIds={completedMissions} onSelectMission={handleSelectMission} />
            </motion.div>
          )}

          {activeTab === "mission" && (
            <motion.div key="mission" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col items-center justify-center">
              {activeMission ? (
                <>
                  <button
                    onClick={() => { setActiveMission(null); setActiveTab("map"); }}
                    className="mb-4 flex items-center gap-1 self-start font-body text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Map
                  </button>
                  <MissionCard mission={activeMission} onComplete={handleMissionComplete} />
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <NovaOwl size="md" message="Pick a mission from the map first! 🗺️" />
                  <button onClick={() => setActiveTab("map")} className="rounded-xl bg-primary px-6 py-3 font-display text-sm text-primary-foreground">
                    Go to Map
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "shop" && (
            <motion.div key="shop" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col items-center">
              <CosmeticShop childId={selectedChild?.id} childName={selectedChild?.name} coins={totalCoins} onCoinsSpent={handleCoinsSpent} />
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col items-center">
              <AchievementsBoard childId={selectedChild?.id} childName={selectedChild?.name} />
            </motion.div>
          )}

          {activeTab === "parent" && (
            <motion.div key="parent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col items-center pb-4">
              <WeeklyProgressReport childId={selectedChild?.id} childName={selectedChild?.name} />
              <div className="mt-6">
                <ParentDashboard childId={selectedChild?.id} childName={selectedChild?.name} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="relative z-10 border-t border-border bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-body text-[10px] font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AddChildModal open={showAddChild} onClose={() => setShowAddChild(false)} onAdded={fetchChildren} />
      <BadgeCelebration achievement={celebrationBadge} onClose={() => setCelebrationBadge(null)} />
    </div>
  );
};

export default DashboardPage;
