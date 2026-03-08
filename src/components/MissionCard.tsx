import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NovaOwl from "./NovaOwl";
import RewardBadge from "./RewardBadge";

const sampleMission = {
  title: "Broken Bridge",
  question: "You have 7 energy points. Each bridge costs energy to cross. Find the path that uses exactly 7 energy!",
  options: [
    { id: "a", label: "Bridge A (3) → Bridge C (4)", correct: true },
    { id: "b", label: "Bridge A (3) → Bridge B (5)", correct: false },
    { id: "c", label: "Bridge B (5) → Bridge C (4)", correct: false },
    { id: "d", label: "Bridge A (3) → Bridge D (2)", correct: false },
  ],
  reward: { coins: 10, xp: 20 },
};

const MissionCard = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const isCorrect = selected && sampleMission.options.find((o) => o.id === selected)?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (isCorrect) {
      setTimeout(() => setShowReward(true), 800);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
    setShowReward(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl text-accent">{sampleMission.title}</h3>
        <span className="rounded-full bg-secondary/20 px-3 py-1 font-body text-xs font-bold text-secondary">
          Strategy
        </span>
      </div>

      <p className="mb-6 font-body text-sm leading-relaxed text-muted-foreground">
        {sampleMission.question}
      </p>

      <div className="mb-6 flex flex-col gap-3">
        {sampleMission.options.map((option) => {
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
            <NovaOwl
              size="sm"
              message={isCorrect ? "Whoa! That was clever! 🌟" : "Hmm… want to try again? 🤔"}
            />
            {showReward && <RewardBadge coins={sampleMission.reward.coins} xp={sampleMission.reward.xp} />}
            {!isCorrect && (
              <button
                onClick={handleReset}
                className="rounded-xl bg-secondary px-6 py-2 font-body text-sm font-bold text-secondary-foreground"
              >
                Try Again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MissionCard;
