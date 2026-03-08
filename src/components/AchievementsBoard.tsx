import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  achievements,
  Achievement,
  AchievementStats,
  tierColors,
  tierBgColors,
} from "@/data/achievements";
import { missionBank } from "@/data/missionBank";

interface AchievementsBoardProps {
  childId?: string;
  childName?: string;
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
}

const ZONE_MISSION_COUNTS: Record<string, number> = {
  arrival: 5,
  foundation: 5,
  strategic: 5,
  adaptive: 5,
  advanced: 5,
};

const computeStats = (attempts: AttemptRow[]): AchievementStats => {
  const completedIds = new Set(attempts.map((a) => a.mission_id));

  // Count zones cleared
  const missionsByZone: Record<string, Set<string>> = {};
  for (const m of missionBank) {
    if (!missionsByZone[m.zone]) missionsByZone[m.zone] = new Set();
    if (completedIds.has(m.id)) missionsByZone[m.zone].add(m.id);
  }
  const zonesCleared = Object.entries(missionsByZone).filter(
    ([zone, ids]) => ids.size >= (ZONE_MISSION_COUNTS[zone] || 5)
  ).length;

  const byType = (type: string) =>
    new Set(attempts.filter((a) => a.mission_type === type).map((a) => a.mission_id)).size;

  return {
    totalCompleted: completedIds.size,
    totalCoins: attempts.reduce((s, a) => s + a.coins_earned, 0),
    totalXp: attempts.reduce((s, a) => s + a.xp_earned, 0),
    perfectMissions: attempts.filter((a) => a.attempts === 1 && a.hints_used === 0).length,
    hintsUsed: attempts.reduce((s, a) => s + a.hints_used, 0),
    totalAttempts: attempts.reduce((s, a) => s + a.attempts, 0),
    zonesCleared,
    patternCompleted: byType("pattern"),
    logicCompleted: byType("logic"),
    strategyCompleted: byType("strategy"),
    planningCompleted: byType("planning"),
    spatialCompleted: byType("spatial"),
    sequenceCompleted: byType("sequence"),
    hardCompleted: new Set(
      attempts.filter((a) => a.difficulty >= 4).map((a) => a.mission_id)
    ).size,
    fastSolves: attempts.filter(
      (a) => a.solve_time_seconds !== null && a.solve_time_seconds < 30
    ).length,
    maxDifficulty: Math.max(0, ...attempts.map((a) => a.difficulty)),
  };
};

const AchievementsBoard = ({ childId, childName }: AchievementsBoardProps) => {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchAttempts();
  }, [childId]);

  const fetchAttempts = async () => {
    setLoading(true);
    let query = supabase
      .from("mission_attempts")
      .select("mission_id, mission_type, difficulty, attempts, hints_used, solve_time_seconds, coins_earned, xp_earned")
      .eq("completed", true);

    if (childId) {
      query = query.eq("child_id", childId);
    }

    const { data } = await query;
    setAttempts((data as AttemptRow[]) || []);
    setLoading(false);
  };

  const stats = computeStats(attempts);
  const earned = achievements.filter((a) => a.requirement(stats));
  const earnedIds = new Set(earned.map((a) => a.id));

  const categories = [
    { id: "all", label: "All" },
    { id: "missions", label: "Missions" },
    { id: "skills", label: "Skills" },
    { id: "special", label: "Special" },
    { id: "streaks", label: "Streaks" },
  ];

  const filtered =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

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
      <div className="mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl text-foreground">Achievements</h3>
      </div>
      <p className="mb-4 font-body text-sm text-muted-foreground">
        {childName ? `${childName} has` : "You have"} earned {earned.length} of {achievements.length} badges
      </p>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earned.length / achievements.length) * 100}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-cosmic-purple"
          />
        </div>
        <p className="mt-1 text-right font-body text-xs text-muted-foreground">
          {earned.length}/{achievements.length}
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-body text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((achievement, i) => {
          const isEarned = earnedIds.has(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`relative flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all ${
                isEarned
                  ? "border-current shadow-md"
                  : "border-border opacity-50"
              }`}
              style={
                isEarned
                  ? {
                      borderColor: tierColors[achievement.tier],
                      backgroundColor: tierBgColors[achievement.tier],
                    }
                  : {}
              }
            >
              {!isEarned && (
                <div className="absolute right-1.5 top-1.5">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <span className="text-2xl">{isEarned ? achievement.icon : "🔒"}</span>
              <p
                className="mt-1 font-display text-xs"
                style={{ color: isEarned ? tierColors[achievement.tier] : undefined }}
              >
                {achievement.title}
              </p>
              <p className="mt-0.5 font-body text-[10px] text-muted-foreground leading-tight">
                {achievement.description}
              </p>
              {isEarned && (
                <span
                  className="mt-1 rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase"
                  style={{
                    backgroundColor: tierBgColors[achievement.tier],
                    color: tierColors[achievement.tier],
                  }}
                >
                  {achievement.tier}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsBoard;
