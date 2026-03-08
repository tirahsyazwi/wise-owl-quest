import { motion } from "framer-motion";
import novaOwl from "@/assets/nova-owl.png";

interface NovaOwlProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-28 h-28",
  lg: "w-40 h-40",
};

const NovaOwl = ({ message, size = "md", className = "" }: NovaOwlProps) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <motion.img
        src={novaOwl}
        alt="Nova Owl - your space guide"
        className={`${sizes[size]} object-contain drop-shadow-lg`}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
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
