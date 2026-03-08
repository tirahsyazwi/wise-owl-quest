import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NovaOwl from "./NovaOwl";
import RewardBadge from "./RewardBadge";
import { Mission, getTypeLabel, getTypeColor } from "@/data/missionBank";

export interface MissionResult {
  missionId: string;
  missionType: string;
  difficulty: number;
  attempts: number;
  hintsUsed: number;
  solveTimeSeconds: number;
  coins: number;
  xp: number;
}

interface MissionCardProps {
  mission?: Mission;
  onComplete?: (result: MissionResult) => void;
}

const defaultMission: Mission = {
  id: "default",
  title: "Broken Bridge",
  type: "strategy",
  zone: "foundation",
  difficulty: 2,
  question: "You have 7 energy points. Each bridge costs energy to cross. Find the path that uses exactly 7 energy!",
  options: [
    { id: "a", label: "Bridge A (3) → Bridge C (4)", correct: true },
    { id: "b", label: "Bridge A (3) → Bridge B (5)", correct: false },
    { id: "c", label: "Bridge B (5) → Bridge C (4)", correct: false },
    { id: "d", label: "Bridge A (3) → Bridge D (2)", correct: false },
  ],
  reward: { coins: 10, xp: 20 },
  mapPosition: { x: 50, y: 50 },
};

const MissionCard = ({ mission, onComplete }: MissionCardProps) => {
  const m = mission || defaultMission;
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const startTime = useRef(Date.now());

  const isCorrect = selected && m.options.find((o) => o.id === selected)?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    setAttempts(attempts + 1);
    if (isCorrect) {
      setTimeout(() => setShowReward(true), 800);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
    setShowReward(false);
    if (attempts >= 1 && !showHint) {
      setShowHint(true);
      setHintsUsed((h) => h + 1);
    }
  };

  const handleComplete = () => {
    if (!onComplete) return;
    const solveTimeSeconds = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      missionId: m.id,
      missionType: m.type,
      difficulty: m.difficulty,
      attempts,
      hintsUsed,
      solveTimeSeconds,
      coins: m.reward.coins,
      xp: m.reward.xp,
    });
  };

  const novaMessage = !submitted
    ? undefined
    : isCorrect
    ? attempts === 1
      ? "Whoa! That was clever! 🌟"
      : "You got it! Never give up! 💪"
    : attempts >= 2
    ? "Ooooh this one is tricky. Try the hint! 🤔"
    : "Hmm… want to try again? 🤔";

  const typeColor = getTypeColor(m.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-xl text-accent">{m.title}</h3>
        <span
          className="rounded-full px-3 py-1 font-body text-xs font-bold"
          style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
        >
          {getTypeLabel(m.type)}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-4 rounded-full ${i < m.difficulty ? "bg-accent" : "bg-muted"}`}
          />
        ))}
        <span className="ml-1 font-body text-xs text-muted-foreground">Lv.{m.difficulty}</span>
      </div>

      <p className="mb-4 font-body text-sm leading-relaxed text-muted-foreground">{m.question}</p>

      {showHint && m.hint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2"
        >
          <p className="font-body text-xs text-accent">
            💡 <span className="font-semibold">Hint:</span> {m.hint}
          </p>
        </motion.div>
      )}

      <div className="mb-6 flex flex-col gap-3">
        {m.options.map((option) => {
          const isSelected = selected === option.id;
          const showResult = submitted && isSelected;
          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: submitted ? 1 : 1.02 }}
              whileTap={{ scale: submitted ? 1 : 0.98 }}
              onClick={() => !submitted && setSelected(option.id)}
              className={`rounded-xl border-2 px-4 py-3 text-left font-body text-sm font-semibold transition-all ${
                showResult && option.correct
                  ? "border-cosmic-green bg-cosmic-green/10 text-cosmic-green"
                  : showResult && !option.correct
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-muted-foreground"
              }`}
              disabled={submitted}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.button
            key="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full rounded-xl bg-primary py-3 font-display text-base text-primary-foreground shadow-lg transition-opacity disabled:opacity-40"
          >
            Check Answer
          </motion.button>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            {novaMessage && <NovaOwl size="sm" message={novaMessage} />}
            {showReward && <RewardBadge coins={m.reward.coins} xp={m.reward.xp} />}
            {isCorrect && onComplete ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={handleComplete}
                className="rounded-xl bg-primary px-6 py-2 font-display text-sm text-primary-foreground"
              >
                Continue →
              </motion.button>
            ) : !isCorrect ? (
              <button
                onClick={handleReset}
                className="rounded-xl bg-secondary px-6 py-2 font-body text-sm font-bold text-secondary-foreground"
              >
                Try Again
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MissionCard;
