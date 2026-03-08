import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Brain,
  Puzzle,
  Target,
  Lightbulb,
  Clock,
  Trophy,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyProgressReportProps {
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

interface WeekStats {
  missionsCompleted: number;
  totalMinutes: number;
  coinsEarned: number;
  xpEarned: number;
  avgDifficulty: number;
  perfectMissions: number;
  avgAttempts: number;
  avgHints: number;
  skills: { strategicPlanning: number; patternRecognition: number; persistence: number; riskEvaluation: number };
}

const getWeekRange = (weeksAgo: number) => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const formatDateShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const computeSkillsFromAttempts = (attempts: AttemptRow[]) => {
  if (attempts.length === 0) return { strategicPlanning: 0, patternRecognition: 0, persistence: 0, riskEvaluation: 0 };

  const strategyAttempts = attempts.filter((a) => ["strategy", "planning"].includes(a.mission_type));
  const avgSA = strategyAttempts.length > 0 ? strategyAttempts.reduce((s, a) => s + a.attempts, 0) / strategyAttempts.length : 3;
  const avgSD = strategyAttempts.length > 0 ? strategyAttempts.reduce((s, a) => s + a.difficulty, 0) / strategyAttempts.length : 1;
  const strategicPlanning = Math.min(100, Math.round((avgSD / 5) * 60 + (1 / avgSA) * 40));

  const patternAttempts = attempts.filter((a) => ["pattern", "sequence"].includes(a.mission_type));
  const avgPD = patternAttempts.length > 0 ? patternAttempts.reduce((s, a) => s + a.difficulty, 0) / patternAttempts.length : 1;
  const patternFirst = patternAttempts.filter((a) => a.attempts === 1).length;
  const patternRecognition = Math.min(100, Math.round((avgPD / 5) * 50 + (patternAttempts.length > 0 ? (patternFirst / patternAttempts.length) * 50 : 0)));

  const totalRetries = attempts.reduce((s, a) => s + Math.max(0, a.attempts - 1), 0);
  const completedHard = attempts.filter((a) => a.difficulty >= 3).length;
  const persistence = Math.min(100, Math.round((attempts.length / 25) * 40 + (completedHard / Math.max(1, attempts.length)) * 40 + Math.min(20, totalRetries * 3)));

  const logicAttempts = attempts.filter((a) => ["logic", "spatial"].includes(a.mission_type));
  const avgH = attempts.reduce((s, a) => s + a.hints_used, 0) / attempts.length;
  const riskEvaluation = Math.min(100, Math.round((logicAttempts.length > 0 ? (logicAttempts.length / Math.max(1, attempts.length)) * 40 : 10) + (1 / (1 + avgH)) * 60));

  return { strategicPlanning, patternRecognition, persistence, riskEvaluation };
};

const computeWeekStats = (attempts: AttemptRow[]): WeekStats => {
  const missionsCompleted = attempts.length;
  const totalMinutes = Math.round(attempts.reduce((s, a) => s + (a.solve_time_seconds || 0), 0) / 60);
  const coinsEarned = attempts.reduce((s, a) => s + a.coins_earned, 0);
  const xpEarned = attempts.reduce((s, a) => s + a.xp_earned, 0);
  const avgDifficulty = attempts.length > 0 ? attempts.reduce((s, a) => s + a.difficulty, 0) / attempts.length : 0;
  const perfectMissions = attempts.filter((a) => a.attempts === 1 && a.hints_used === 0).length;
  const avgAttempts = attempts.length > 0 ? attempts.reduce((s, a) => s + a.attempts, 0) / attempts.length : 0;
  const avgHints = attempts.length > 0 ? attempts.reduce((s, a) => s + a.hints_used, 0) / attempts.length : 0;
  const skills = computeSkillsFromAttempts(attempts);
  return { missionsCompleted, totalMinutes, coinsEarned, xpEarned, avgDifficulty, perfectMissions, avgAttempts, avgHints, skills };
};

const TrendIcon = ({ current, previous }: { current: number; previous: number }) => {
  if (current > previous) return <TrendingUp className="h-3 w-3 text-cosmic-green" />;
  if (current < previous) return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

const generateInsights = (current: WeekStats, previous: WeekStats | null): string[] => {
  const insights: string[] = [];

  if (!previous || previous.missionsCompleted === 0) {
    if (current.missionsCompleted > 0) {
      insights.push(`Great start! ${current.missionsCompleted} mission${current.missionsCompleted > 1 ? "s" : ""} completed this week 🚀`);
      if (current.perfectMissions > 0) insights.push(`${current.perfectMissions} perfect solve${current.perfectMissions > 1 ? "s" : ""} — no hints needed! ⭐`);
    } else {
      insights.push("No missions completed this week. Encourage your explorer to try one! 🌟");
    }
    return insights;
  }

  const missionDiff = current.missionsCompleted - previous.missionsCompleted;
  if (missionDiff > 0) insights.push(`${missionDiff} more mission${missionDiff > 1 ? "s" : ""} than last week — great momentum! 📈`);
  else if (missionDiff < 0) insights.push(`${Math.abs(missionDiff)} fewer mission${Math.abs(missionDiff) > 1 ? "s" : ""} than last week — a little nudge could help! 💪`);

  if (current.avgDifficulty > previous.avgDifficulty + 0.3) insights.push("Tackling harder challenges this week — impressive growth! 🧠");
  if (current.perfectMissions > previous.perfectMissions) insights.push(`More perfect solves this week (${current.perfectMissions} vs ${previous.perfectMissions}) — skills are sharpening! ✨`);
  if (current.avgHints < previous.avgHints && current.missionsCompleted > 0) insights.push("Using fewer hints — developing more independent thinking! 🎯");

  const skillNames = ["strategicPlanning", "patternRecognition", "persistence", "riskEvaluation"] as const;
  const labels = { strategicPlanning: "Strategic Planning", patternRecognition: "Pattern Recognition", persistence: "Persistence", riskEvaluation: "Risk Evaluation" };
  for (const sk of skillNames) {
    const diff = current.skills[sk] - previous.skills[sk];
    if (diff >= 10) insights.push(`${labels[sk]} jumped +${diff} points — a real breakthrough! 🌟`);
  }

  if (insights.length === 0) insights.push("Steady progress this week — consistency is key! 🔑");

  return insights.slice(0, 4);
};

const generateTips = (stats: WeekStats): string[] => {
  const tips: string[] = [];
  if (stats.missionsCompleted === 0) {
    tips.push("Try starting with a Level 1 mission to build confidence.");
    return tips;
  }
  if (stats.avgHints > 1.5) tips.push("Encourage trying once more before using hints — builds resilience.");
  if (stats.avgDifficulty < 2) tips.push("Ready for a challenge? Try missions in the Strategic or Advanced zones.");
  if (stats.skills.patternRecognition < 30) tips.push("Pattern missions are great for building analytical thinking.");
  if (stats.skills.persistence < 30) tips.push("Praise effort over speed — persistence grows with encouragement.");
  if (stats.perfectMissions === 0 && stats.missionsCompleted > 2) tips.push("Challenge them to solve one mission on the first try without hints!");
  if (tips.length === 0) tips.push("Keep up the great work — explore new mission zones for variety! 🗺️");
  return tips.slice(0, 2);
};

const WeeklyProgressReport = ({ childId, childName }: WeeklyProgressReportProps) => {
  const [allAttempts, setAllAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeksAgo, setWeeksAgo] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      let query = supabase.from("mission_attempts").select("*").eq("completed", true).order("created_at", { ascending: false });
      if (childId) query = query.eq("child_id", childId);
      const { data } = await query;
      setAllAttempts((data as AttemptRow[]) || []);
      setLoading(false);
    };
    fetchAll();
  }, [childId]);

  const { currentWeek, previousWeek, weekRange } = useMemo(() => {
    const range = getWeekRange(weeksAgo);
    const prevRange = getWeekRange(weeksAgo + 1);
    const currentFiltered = allAttempts.filter((a) => {
      const d = new Date(a.created_at);
      return d >= range.start && d <= range.end;
    });
    const prevFiltered = allAttempts.filter((a) => {
      const d = new Date(a.created_at);
      return d >= prevRange.start && d <= prevRange.end;
    });
    return {
      currentWeek: computeWeekStats(currentFiltered),
      previousWeek: prevFiltered.length > 0 ? computeWeekStats(prevFiltered) : null,
      weekRange: range,
    };
  }, [allAttempts, weeksAgo]);

  const insights = useMemo(() => generateInsights(currentWeek, previousWeek), [currentWeek, previousWeek]);
  const tips = useMemo(() => generateTips(currentWeek), [currentWeek]);

  const skillData = [
    { name: "Strategic Planning", key: "strategicPlanning" as const, icon: Brain, color: "hsl(170, 70%, 45%)" },
    { name: "Pattern Recognition", key: "patternRecognition" as const, icon: Puzzle, color: "hsl(45, 95%, 58%)" },
    { name: "Persistence", key: "persistence" as const, icon: TrendingUp, color: "hsl(145, 65%, 50%)" },
    { name: "Risk Evaluation", key: "riskEvaluation" as const, icon: Target, color: "hsl(260, 60%, 55%)" },
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
    <div className="w-full max-w-lg space-y-4">
      {/* Header with week navigation */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg text-foreground">Weekly Report</h3>
            </div>
            <p className="mt-0.5 font-body text-xs text-muted-foreground">
              {childName ? `${childName}'s` : ""} progress · {formatDateShort(weekRange.start)} – {formatDateShort(weekRange.end)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeeksAgo((w) => w + 1)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeeksAgo((w) => Math.max(0, w - 1))}
              disabled={weeksAgo === 0}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { icon: Trophy, label: "Missions", value: currentWeek.missionsCompleted, prev: previousWeek?.missionsCompleted, color: "text-accent" },
            { icon: Clock, label: "Minutes", value: currentWeek.totalMinutes, prev: previousWeek?.totalMinutes, color: "text-primary" },
            { icon: Star, label: "Perfect", value: currentWeek.perfectMissions, prev: previousWeek?.perfectMissions, color: "text-cosmic-gold" },
            { icon: Zap, label: "XP", value: currentWeek.xpEarned, prev: previousWeek?.xpEarned, color: "text-cosmic-green" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-muted/70 p-3 text-center">
              <stat.icon className={`mx-auto mb-1 h-4 w-4 ${stat.color}`} />
              <div className="flex items-center justify-center gap-1">
                <p className={`font-display text-xl ${stat.color}`}>{stat.value}</p>
                {stat.prev !== undefined && <TrendIcon current={stat.value} previous={stat.prev} />}
              </div>
              <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Comparison */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h4 className="mb-3 flex items-center gap-2 font-display text-sm text-foreground">
          <Brain className="h-4 w-4 text-primary" />
          Thinking Skills This Week
        </h4>
        <div className="flex flex-col gap-3">
          {skillData.map((skill, i) => {
            const current = currentWeek.skills[skill.key];
            const prev = previousWeek?.skills[skill.key] ?? 0;
            const diff = current - prev;
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <skill.icon className="h-3.5 w-3.5" style={{ color: skill.color }} />
                    <span className="font-body text-xs font-semibold text-foreground">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-body text-xs font-bold" style={{ color: skill.color }}>
                      {current}
                    </span>
                    {previousWeek && diff !== 0 && (
                      <span className={`font-body text-[10px] font-bold ${diff > 0 ? "text-cosmic-green" : "text-destructive"}`}>
                        {diff > 0 ? "+" : ""}{diff}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  {previousWeek && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full opacity-25"
                      style={{ backgroundColor: skill.color, width: `${prev}%` }}
                    />
                  )}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${current}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h4 className="mb-3 flex items-center gap-2 font-display text-sm text-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          Weekly Insights
        </h4>
        <AnimatePresence mode="wait">
          <motion.div
            key={weeksAgo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg bg-muted/50 px-3 py-2"
              >
                <p className="font-body text-xs text-foreground">{insight}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Parent Tips */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xl">
        <h4 className="mb-3 flex items-center gap-2 font-display text-sm text-primary">
          <Lightbulb className="h-4 w-4" />
          Tips for Parents
        </h4>
        <div className="flex flex-col gap-2">
          {tips.map((tip, i) => (
            <p key={i} className="font-body text-xs text-foreground/80">
              💡 {tip}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgressReport;
