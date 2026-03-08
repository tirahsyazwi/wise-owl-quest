export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "missions" | "skills" | "streaks" | "special";
  requirement: (stats: AchievementStats) => boolean;
  tier: "bronze" | "silver" | "gold" | "cosmic";
}

export interface AchievementStats {
  totalCompleted: number;
  totalCoins: number;
  totalXp: number;
  perfectMissions: number; // first try, no hints
  hintsUsed: number;
  totalAttempts: number;
  zonesCleared: number;
  patternCompleted: number;
  logicCompleted: number;
  strategyCompleted: number;
  planningCompleted: number;
  spatialCompleted: number;
  sequenceCompleted: number;
  hardCompleted: number; // difficulty >= 4
  fastSolves: number; // under 30s
  maxDifficulty: number;
}

export const achievements: Achievement[] = [
  // ── MISSION MILESTONES ──
  {
    id: "first_mission",
    title: "Liftoff!",
    description: "Complete your first mission",
    icon: "🚀",
    category: "missions",
    tier: "bronze",
    requirement: (s) => s.totalCompleted >= 1,
  },
  {
    id: "five_missions",
    title: "Space Cadet",
    description: "Complete 5 missions",
    icon: "⭐",
    category: "missions",
    tier: "bronze",
    requirement: (s) => s.totalCompleted >= 5,
  },
  {
    id: "ten_missions",
    title: "Star Pilot",
    description: "Complete 10 missions",
    icon: "🌟",
    category: "missions",
    tier: "silver",
    requirement: (s) => s.totalCompleted >= 10,
  },
  {
    id: "twenty_missions",
    title: "Galaxy Explorer",
    description: "Complete 20 missions",
    icon: "🌌",
    category: "missions",
    tier: "gold",
    requirement: (s) => s.totalCompleted >= 20,
  },
  {
    id: "all_missions",
    title: "Universe Champion",
    description: "Complete all 25 missions",
    icon: "👑",
    category: "missions",
    tier: "cosmic",
    requirement: (s) => s.totalCompleted >= 25,
  },

  // ── SKILL BADGES ──
  {
    id: "pattern_master",
    title: "Pattern Spotter",
    description: "Complete 5 pattern missions",
    icon: "🔮",
    category: "skills",
    tier: "silver",
    requirement: (s) => s.patternCompleted >= 5,
  },
  {
    id: "logic_whiz",
    title: "Logic Whiz",
    description: "Complete 5 logic missions",
    icon: "🧩",
    category: "skills",
    tier: "silver",
    requirement: (s) => s.logicCompleted >= 5,
  },
  {
    id: "strategy_ace",
    title: "Strategy Ace",
    description: "Complete 5 strategy missions",
    icon: "🎯",
    category: "skills",
    tier: "silver",
    requirement: (s) => s.strategyCompleted >= 5,
  },
  {
    id: "planner_pro",
    title: "Master Planner",
    description: "Complete 3 planning missions",
    icon: "📋",
    category: "skills",
    tier: "silver",
    requirement: (s) => s.planningCompleted >= 3,
  },
  {
    id: "spatial_sense",
    title: "Space Navigator",
    description: "Complete 5 spatial missions",
    icon: "🧭",
    category: "skills",
    tier: "silver",
    requirement: (s) => s.spatialCompleted >= 5,
  },

  // ── SPECIAL ACHIEVEMENTS ──
  {
    id: "perfect_three",
    title: "Sharp Mind",
    description: "Solve 3 missions on the first try",
    icon: "💎",
    category: "special",
    tier: "bronze",
    requirement: (s) => s.perfectMissions >= 3,
  },
  {
    id: "perfect_ten",
    title: "Brilliant Brain",
    description: "Solve 10 missions on the first try",
    icon: "🧠",
    category: "special",
    tier: "gold",
    requirement: (s) => s.perfectMissions >= 10,
  },
  {
    id: "no_hints",
    title: "Independent Thinker",
    description: "Complete 5 missions without any hints",
    icon: "💡",
    category: "special",
    tier: "silver",
    requirement: (s) => s.perfectMissions >= 5,
  },
  {
    id: "speed_demon",
    title: "Lightning Fast",
    description: "Solve 3 missions in under 30 seconds each",
    icon: "⚡",
    category: "special",
    tier: "silver",
    requirement: (s) => s.fastSolves >= 3,
  },
  {
    id: "hard_mode",
    title: "Fearless Explorer",
    description: "Complete 3 difficulty 4+ missions",
    icon: "🔥",
    category: "special",
    tier: "gold",
    requirement: (s) => s.hardCompleted >= 3,
  },
  {
    id: "zone_clearer",
    title: "Zone Master",
    description: "Clear all missions in any zone",
    icon: "🏆",
    category: "special",
    tier: "gold",
    requirement: (s) => s.zonesCleared >= 1,
  },
  {
    id: "coin_collector",
    title: "Treasure Hunter",
    description: "Earn 200 coins total",
    icon: "💰",
    category: "missions",
    tier: "silver",
    requirement: (s) => s.totalCoins >= 200,
  },
  {
    id: "xp_master",
    title: "XP Legend",
    description: "Earn 500 XP total",
    icon: "✨",
    category: "missions",
    tier: "gold",
    requirement: (s) => s.totalXp >= 500,
  },
  {
    id: "max_difficulty",
    title: "Supernova Mind",
    description: "Complete a difficulty 5 mission",
    icon: "🌠",
    category: "special",
    tier: "cosmic",
    requirement: (s) => s.maxDifficulty >= 5,
  },
  {
    id: "persistence",
    title: "Never Give Up",
    description: "Use 10+ total attempts across missions (and still succeed!)",
    icon: "💪",
    category: "streaks",
    tier: "bronze",
    requirement: (s) => s.totalAttempts >= 10 && s.totalCompleted >= 5,
  },
];

export const tierColors: Record<Achievement["tier"], string> = {
  bronze: "hsl(30, 60%, 50%)",
  silver: "hsl(220, 10%, 70%)",
  gold: "hsl(45, 95%, 58%)",
  cosmic: "hsl(260, 60%, 55%)",
};

export const tierBgColors: Record<Achievement["tier"], string> = {
  bronze: "hsl(30, 60%, 50%, 0.15)",
  silver: "hsl(220, 10%, 70%, 0.15)",
  gold: "hsl(45, 95%, 58%, 0.15)",
  cosmic: "hsl(260, 60%, 55%, 0.15)",
};
