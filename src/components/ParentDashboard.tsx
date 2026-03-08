import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Target, Puzzle, TrendingUp, Clock, Trophy, Zap, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ParentDashboardProps {
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
  created_at: string;
}

const getLabel = (level: number) => {
  if (level >= 80) return "Very Strong";
  if (level >= 60) return "Strong";
  if (level >= 40) return "Developing";
  if (level >= 20) return "Emerging";
  return "Just Started";
};

const computeSkills = (attempts: AttemptRow[]) => {
  if (attempts.length === 0) {
    return {
      strategicPlanning: 0,
      patternRecognition: 0,
      persistence: 0,
      riskEvaluation: 0,
    };
  }

  // Strategic Planning: higher difficulty completed with fewer attempts = better
  const strategyAttempts = attempts.filter((a) =>
    ["strategy", "planning"].includes(a.mission_type)
  );
  const avgStrategyAttempts = strategyAttempts.length > 0
    ? strategyAttempts.reduce((s, a) => s + a.attempts, 0) / strategyAttempts.length
    : 3;
  const avgStrategyDifficulty = strategyAttempts.length > 0
    ? strategyAttempts.reduce((s, a) => s + a.difficulty, 0) / strategyAttempts.length
    : 1;
  const strategicPlanning = Math.min(100, Math.round(
    (avgStrategyDifficulty / 5) * 60 + (1 / avgStrategyAttempts) * 40
  ));

  // Pattern Recognition: pattern/sequence missions, weighted by difficulty
  const patternAttempts = attempts.filter((a) =>
    ["pattern", "sequence"].includes(a.mission_type)
  );
  const avgPatternDifficulty = patternAttempts.length > 0
    ? patternAttempts.reduce((s, a) => s + a.difficulty, 0) / patternAttempts.length
    : 1;
  const patternFirstTry = patternAttempts.filter((a) => a.attempts === 1).length;
  const patternRecognition = Math.min(100, Math.round(
    (avgPatternDifficulty / 5) * 50 +
    (patternAttempts.length > 0 ? (patternFirstTry / patternAttempts.length) * 50 : 0)
  ));

  // Persistence: completing harder missions even with retries
  const totalRetries = attempts.reduce((s, a) => s + Math.max(0, a.attempts - 1), 0);
  const completedHard = attempts.filter((a) => a.difficulty >= 3).length;
  const persistence = Math.min(100, Math.round(
    (attempts.length / 25) * 40 +
    (completedHard / Math.max(1, attempts.length)) * 40 +
    Math.min(20, totalRetries * 3)
  ));

  // Risk Evaluation: logic/spatial with low hint usage
  const logicAttempts = attempts.filter((a) =>
    ["logic", "spatial"].includes(a.mission_type)
  );
  const avgHints = attempts.length > 0
    ? attempts.reduce((s, a) => s + a.hints_used, 0) / attempts.length
    : 1;
  const riskEvaluation = Math.min(100, Math.round(
    (logicAttempts.length > 0 ? (logicAttempts.length / Math.max(1, attempts.length)) * 40 : 10) +
    (1 / (1 + avgHints)) * 60
  ));

  return { strategicPlanning, patternRecognition, persistence, riskEvaluation };
};

const ParentDashboard = ({ childId, childName }: ParentDashboardProps) => {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, [childId]);

  const fetchAttempts = async () => {
    setLoading(true);
    let query = supabase
      .from("mission_attempts")
      .select("*")
      .eq("completed", true)
      .order("created_at", { ascending: false });

    if (childId) {
      query = query.eq("child_id", childId);
    }

    const { data } = await query;
    setAttempts((data as AttemptRow[]) || []);
    setLoading(false);
  };

  // Compute stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAttempts = attempts.filter(
    (a) => new Date(a.created_at) >= weekAgo
  );

  const totalMinutes = Math.round(
    weekAttempts.reduce((s, a) => s + (a.solve_time_seconds || 0), 0) / 60
  );
  const missionsThisWeek = weekAttempts.length;
  const totalCoins = attempts.reduce((s, a) => s + a.coins_earned, 0);
  const totalXp = attempts.reduce((s, a) => s + a.xp_earned, 0);

  const skills = computeSkills(attempts);

  const skillData = [
    { name: "Strategic Planning", level: skills.strategicPlanning, icon: Brain, color: "hsl(170, 70%, 45%)" },
    { name: "Pattern Recognition", level: skills.patternRecognition, icon: Puzzle, color: "hsl(45, 95%, 58%)" },
    { name: "Persistence", level: skills.persistence, icon: TrendingUp, color: "hsl(145, 65%, 50%)" },
    { name: "Risk Evaluation", level: skills.riskEvaluation, icon: Target, color: "hsl(260, 60%, 55%)" },
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
      <h3 className="mb-1 font-display text-xl text-foreground">
        Parent Dashboard
      </h3>
      <p className="mb-6 font-body text-sm text-muted-foreground">
        {childName ? `${childName}'s` : "This"} week's thinking skills summary
      </p>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-muted p-3 text-center">
          <Clock className="mx-auto mb-1 h-4 w-4 text-primary" />
          <p className="font-display text-xl text-primary">{totalMinutes}</p>
          <p className="font-body text-[10px] text-muted-foreground">Min played</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <Trophy className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="font-display text-xl text-accent">{missionsThisWeek}</p>
          <p className="font-body text-[10px] text-muted-foreground">This week</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <Zap className="mx-auto mb-1 h-4 w-4 text-cosmic-gold" />
          <p className="font-display text-xl text-cosmic-gold">{totalCoins}</p>
          <p className="font-body text-[10px] text-muted-foreground">Total coins</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <Lightbulb className="mx-auto mb-1 h-4 w-4 text-cosmic-green" />
          <p className="font-display text-xl text-cosmic-green">{totalXp}</p>
          <p className="font-body text-[10px] text-muted-foreground">Total XP</p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="rounded-xl bg-muted/50 px-4 py-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            No missions completed yet. Skills will appear here after your child completes their first mission! 🚀
          </p>
        </div>
      ) : (
        <>
          {/* Thinking Skills */}
          <h4 className="mb-3 font-display text-sm text-foreground">Thinking Skills</h4>
          <div className="flex flex-col gap-4">
            {skillData.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <skill.icon className="h-4 w-4" style={{ color: skill.color }} />
                    <span className="font-body text-sm font-semibold text-foreground">{skill.name}</span>
                  </div>
                  <span className="font-body text-xs font-bold" style={{ color: skill.color }}>
                    {getLabel(skill.level)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <h4 className="mb-3 mt-6 font-display text-sm text-foreground">Recent Missions</h4>
          <div className="flex flex-col gap-2">
            {attempts.slice(0, 5).map((a) => (
              <div
                key={a.mission_id + a.created_at}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
              >
                <div>
                  <p className="font-body text-xs font-semibold text-foreground">{a.mission_id}</p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    {a.attempts} attempt{a.attempts > 1 ? "s" : ""} • {a.hints_used} hint{a.hints_used !== 1 ? "s" : ""} • {a.solve_time_seconds || 0}s
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs font-bold text-cosmic-gold">+{a.coins_earned}</span>
                  <span className="font-body text-xs font-bold text-primary">+{a.xp_earned} XP</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentDashboard;
