import { motion } from "framer-motion";
import novaOwl from "@/assets/nova-owl.png";

interface NovaOwlProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  equippedOutfit?: string | null;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-28 h-28",
  lg: "w-40 h-40",
};

const outfitOverlays: Record<string, { emoji: string; position: string; size: string }> = {
  "owl-astronaut": { emoji: "🧑‍🚀", position: "-top-1 -right-1", size: "text-lg" },
  "owl-detective": { emoji: "🕵️", position: "-top-1 -right-1", size: "text-lg" },
  "owl-wizard": { emoji: "🧙", position: "-top-1 -right-1", size: "text-lg" },
  "owl-pirate": { emoji: "🏴‍☠️", position: "-top-1 -right-1", size: "text-lg" },
  "owl-ninja": { emoji: "🥷", position: "-top-1 -right-1", size: "text-lg" },
  "owl-superhero": { emoji: "🦸", position: "-top-1 -right-1", size: "text-lg" },
  "owl-robot": { emoji: "🤖", position: "-top-1 -right-1", size: "text-lg" },
  "owl-galaxy": { emoji: "🌌", position: "-top-1 -right-1", size: "text-lg" },
};

const outfitGlows: Record<string, string> = {
  "owl-astronaut": "drop-shadow(0 0 6px hsl(210, 80%, 60%))",
  "owl-detective": "drop-shadow(0 0 6px hsl(45, 90%, 55%))",
  "owl-wizard": "drop-shadow(0 0 8px hsl(280, 70%, 60%))",
  "owl-pirate": "drop-shadow(0 0 6px hsl(0, 70%, 55%))",
  "owl-ninja": "drop-shadow(0 0 6px hsl(220, 15%, 40%))",
  "owl-superhero": "drop-shadow(0 0 10px hsl(350, 80%, 55%))",
  "owl-robot": "drop-shadow(0 0 8px hsl(170, 70%, 45%))",
  "owl-galaxy": "drop-shadow(0 0 12px hsl(260, 80%, 65%)) drop-shadow(0 0 20px hsl(280, 60%, 50%))",
};

const NovaOwl = ({ message, size = "md", className = "", equippedOutfit }: NovaOwlProps) => {
  const overlay = equippedOutfit ? outfitOverlays[equippedOutfit] : null;
  const glow = equippedOutfit ? outfitGlows[equippedOutfit] : undefined;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative">
        <motion.img
          src={novaOwl}
          alt="Nova Owl - your space guide"
          className={`${sizes[size]} object-contain`}
          style={{ filter: glow || "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {overlay && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`absolute ${overlay.position} ${overlay.size}`}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
          >
            {overlay.emoji}
          </motion.span>
        )}
        {equippedOutfit === "owl-galaxy" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(260, 80%, 65%, 0.2) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative max-w-xs rounded-2xl border border-border bg-card px-5 py-3 text-center font-body text-sm text-card-foreground shadow-lg"
        >
          <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card" />
          <span className="relative z-10">{message}</span>
        </motion.div>
      )}
    </div>
  );
};

export default NovaOwl;
