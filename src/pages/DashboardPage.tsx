import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Star, Map, Gamepad2, BarChart3, LogOut, Plus, UserCircle, ArrowLeft, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NovaOwl from "@/components/NovaOwl";
import WorldMap from "@/components/WorldMap";
import MissionCard, { MissionResult } from "@/components/MissionCard";
import ParentDashboard from "@/components/ParentDashboard";
import RewardBadge from "@/components/RewardBadge";
import AddChildModal from "@/components/AddChildModal";
import { Mission, missionBank } from "@/data/missionBank";

type Tab = "home" | "map" | "mission" | "parent";

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

const DashboardPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedChild) fetchProgress();
  }, [selectedChild]);

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .order("created_at");
    if (error) {
      toast.error("Failed to load children");
    } else {
      setChildren(data || []);
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    }
    setLoadingChildren(false);
  };

  const fetchProgress = async () => {
    if (!selectedChild) return;
    const { data } = await supabase
      .from("mission_attempts")
      .select("mission_id, coins_earned, xp_earned")
      .eq("child_id", selectedChild.id)
      .eq("completed", true);

    if (data) {
      setCompletedMissions(data.map((d) => d.mission_id));
      setTotalCoins(data.reduce((s, d) => s + d.coins_earned, 0));
      setTotalXp(data.reduce((s, d) => s + d.xp_earned, 0));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSelectMission = (mission: Mission) => {
    setActiveMission(mission);
    setActiveTab("mission");
  };

  const handleMissionComplete = async (result: MissionResult) => {
    if (!user || !selectedChild) return;

    // Save to database
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

    if (error) {
      console.error("Failed to save attempt:", error);
    }

    setCompletedMissions((prev) => [...prev, result.missionId]);
    setTotalCoins((prev) => prev + result.coins);
    setTotalXp((prev) => prev + result.xp);
    toast.success(`+${result.coins} coins, +${result.xp} XP!`);
    setActiveMission(null);
    setActiveTab("map");
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Rocket },
    { id: "map", label: "Map", icon: Map },
    { id: "mission", label: "Mission", icon: Gamepad2 },
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
              <button
                onClick={() => setShowAddChild(true)}
                className="rounded-full p-1 text-muted-foreground hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
          <button onClick={handleSignOut} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center gap-6 text-center"
            >
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
                  <button
                    onClick={() => setActiveTab("map")}
                    className="rounded-xl bg-primary px-6 py-3 font-display text-sm text-primary-foreground"
                  >
                    Go to Map
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "parent" && (
            <motion.div key="parent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-1 flex-col items-center justify-center">
              <ParentDashboard childId={selectedChild?.id} childName={selectedChild?.name} />
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
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-body text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AddChildModal open={showAddChild} onClose={() => setShowAddChild(false)} onAdded={fetchChildren} />
    </div>
  );
};

export default DashboardPage;
