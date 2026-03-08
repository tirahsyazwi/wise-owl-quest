import { motion } from "framer-motion";
import { Lock, Check, Star } from "lucide-react";

interface MissionNodeProps {
  title: string;
  status: "locked" | "available" | "completed";
  position: { x: number; y: number };
  color: string;
  onClick?: () => void;
  delay?: number;
}

const MissionNode = ({ title, status, position, color, onClick, delay = 0 }: MissionNodeProps) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={!isLocked ? { scale: 1.15 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className="absolute flex flex-col items-center gap-1"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-4 transition-all ${
          isLocked
            ? "border-muted bg-muted/50 opacity-50"
            : isCompleted
            ? "border-cosmic-green bg-cosmic-green/20 shadow-lg"
            : `border-current bg-current/20 shadow-lg`
        } ${!isLocked ? "animate-pulse-glow" : ""}`}
        style={!isLocked && !isCompleted ? { color, borderColor: color, backgroundColor: `${color}33` } : {}}
      >
        {isLocked ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : isCompleted ? (
          <Check className="h-6 w-6 text-cosmic-green" />
        ) : (
          <Star className="h-6 w-6" style={{ color }} />
        )}
      </div>
      <span className={`font-body text-xs font-bold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
        {title}
      </span>
    </motion.button>
  );
};

export default MissionNode;
