import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Achievement, tierColors } from "@/data/achievements";

interface BadgeCelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const CONFETTI_COLORS = [
  "hsl(45, 95%, 58%)",
  "hsl(170, 70%, 45%)",
  "hsl(260, 60%, 55%)",
  "hsl(0, 84%, 60%)",
  "hsl(210, 80%, 60%)",
  "hsl(145, 65%, 50%)",
];

const ConfettiPiece = ({ index }: { index: number }) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const rotation = Math.random() * 360;
  const size = 6 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;

  return (
    <motion.div
      className="pointer-events-none absolute top-0"
      style={{
        left: `${left}%`,
        width: size,
        height: isCircle ? size : size * 2.5,
        backgroundColor: color,
        borderRadius: isCircle ? "50%" : "2px",
      }}
      initial={{ y: -20, opacity: 1, rotate: rotation, scale: 0 }}
      animate={{
        y: ["-5%", "110%"],
        opacity: [1, 1, 0],
        rotate: rotation + 720,
        scale: [0, 1, 0.8],
        x: [0, (Math.random() - 0.5) * 120],
      }}
      transition={{
        duration: 2 + Math.random(),
        delay,
        ease: "easeOut",
      }}
    />
  );
};

const playUnlockSound = () => {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

    // Sparkle arpeggio
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.type = i < 3 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      noteGain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });

    // Final shimmer chord
    [1047, 1319, 1568].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime + 0.6);
      osc.stop(ctx.currentTime + 1.2);
    });
  } catch {}
};

const BadgeCelebration = ({ achievement, onClose }: BadgeCelebrationProps) => {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (achievement) {
      playUnlockSound();
      const timer = setTimeout(handleClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, handleClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </div>

          {/* Badge card */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-3 rounded-3xl border-2 bg-card p-8 shadow-2xl"
            style={{ borderColor: tierColors[achievement.tier] }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-1 rounded-3xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${tierColors[achievement.tier]}, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.p
              className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Badge Unlocked!
            </motion.p>

            <motion.span
              className="text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {achievement.icon}
            </motion.span>

            <motion.h2
              className="font-display text-xl"
              style={{ color: tierColors[achievement.tier] }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {achievement.title}
            </motion.h2>

            <motion.p
              className="max-w-[200px] text-center font-body text-xs text-muted-foreground"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {achievement.description}
            </motion.p>

            <motion.span
              className="rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase"
              style={{
                color: tierColors[achievement.tier],
                backgroundColor: `${tierColors[achievement.tier]}22`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {achievement.tier}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeCelebration;
