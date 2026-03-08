import { motion } from "framer-motion";
import { Brain, Target, Puzzle, TrendingUp } from "lucide-react";

const skills = [
  { name: "Strategic Planning", level: 72, icon: Brain, color: "hsl(170, 70%, 45%)" },
  { name: "Pattern Recognition", level: 55, icon: Puzzle, color: "hsl(45, 95%, 58%)" },
  { name: "Persistence", level: 88, icon: TrendingUp, color: "hsl(145, 65%, 50%)" },
  { name: "Risk Evaluation", level: 40, icon: Target, color: "hsl(260, 60%, 55%)" },
];

const getLabel = (level: number) => {
  if (level >= 80) return "Very Strong";
  if (level >= 60) return "Strong";
  if (level >= 40) return "Developing";
  return "Emerging";
};

const ParentDashboard = () => {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
      <h3 className="mb-1 font-display text-xl text-foreground">Parent Dashboard</h3>
      <p className="mb-6 font-body text-sm text-muted-foreground">
        This week's thinking skills summary
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted p-4 text-center">
          <p className="font-display text-2xl text-primary">24</p>
          <p className="font-body text-xs text-muted-foreground">Minutes played</p>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center">
          <p className="font-display text-2xl text-accent">8</p>
          <p className="font-body text-xs text-muted-foreground">Missions done</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {skills.map((skill, i) => (
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
    </div>
  );
};

export default ParentDashboard;
