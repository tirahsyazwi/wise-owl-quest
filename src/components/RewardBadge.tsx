import { motion } from "framer-motion";
import { Star, Coins } from "lucide-react";

interface RewardBadgeProps {
  coins?: number;
  xp?: number;
}

const RewardBadge = ({ coins = 0, xp = 0 }: RewardBadgeProps) => {
  return (
    <div className="flex items-center gap-4">
      {coins > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-body text-sm font-bold text-accent"
        >
          <Coins className="h-4 w-4" />
          {coins}
        </motion.div>
      )}
      {xp > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-body text-sm font-bold text-primary"
        >
          <Star className="h-4 w-4" />
          {xp} XP
        </motion.div>
      )}
    </div>
  );
};

export default RewardBadge;
