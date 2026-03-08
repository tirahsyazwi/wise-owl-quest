import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, Rocket, ArrowRight, Sparkles } from "lucide-react";
import NovaOwl from "@/components/NovaOwl";
import MissionCard from "@/components/MissionCard";
import { onboardingMissions } from "@/data/missionBank";

const steps = [
  {
    type: "welcome" as const,
    title: "Welcome to SparkMind!",
    subtitle: "A space adventure for your brain 🧠",
    novaMessage: "Hi there, explorer! I'm Nova — your space guide! Ready for an adventure?",
  },
  {
    type: "meet" as const,
    title: "Meet Nova Owl!",
    subtitle: "I'll help you think through every mission",
    novaMessage: "I'll give you hints, cheer you on, and celebrate your wins! Let's be a team! 🦉",
  },
  {
    type: "mission" as const,
    missionIndex: 0,
  },
  {
    type: "mission" as const,
    missionIndex: 1,
  },
  {
    type: "mission" as const,
    missionIndex: 2,
  },
  {
    type: "complete" as const,
    title: "You're Ready!",
    subtitle: "Time to explore the Mission Planet",
    novaMessage: "Woooo! You're a natural thinker! Let's go explore the galaxy together! 🚀🌟",
  },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="star-field flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="relative z-10 px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="font-body text-xs font-bold text-accent">Onboarding</span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {step.type === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Star className="mb-4 h-16 w-16 text-accent" />
              </motion.div>
              <h1 className="mb-2 font-display text-3xl text-foreground">{step.title}</h1>
              <p className="mb-8 font-body text-sm text-muted-foreground">{step.subtitle}</p>
              <NovaOwl size="lg" message={step.novaMessage} />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={goNext}
                className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-lg"
                style={{ boxShadow: "var(--shadow-glow-teal)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Let's Go!
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}

          {step.type === "meet" && (
            <motion.div
              key="meet"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="mb-2 font-display text-2xl text-foreground">{step.title}</h2>
              <p className="mb-6 font-body text-sm text-muted-foreground">{step.subtitle}</p>
              <NovaOwl size="lg" message={step.novaMessage} />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={goNext}
                className="mt-8 flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 font-display text-lg text-accent-foreground shadow-lg"
                style={{ boxShadow: "var(--shadow-glow-gold)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                I'm Ready!
                <Rocket className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}

          {step.type === "mission" && (
            <motion.div
              key={`mission-${step.missionIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center"
            >
              <p className="mb-4 font-body text-xs font-bold text-primary">
                Practice Mission {(step.missionIndex ?? 0) + 1}
              </p>
              <MissionCard
                mission={onboardingMissions[step.missionIndex ?? 0]}
                onComplete={() => goNext()}
              />
            </motion.div>
          )}

          {step.type === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Rocket className="mb-4 h-16 w-16 text-primary" />
              </motion.div>
              <h2 className="mb-2 font-display text-3xl text-foreground">{step.title}</h2>
              <p className="mb-6 font-body text-sm text-muted-foreground">{step.subtitle}</p>
              <NovaOwl size="lg" message={step.novaMessage} />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={goNext}
                className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-lg"
                style={{ boxShadow: "var(--shadow-glow-teal)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore the Galaxy!
                <Sparkles className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default OnboardingPage;
