import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Star, ChevronDown, Map, Gamepad2, BarChart3 } from "lucide-react";
import NovaOwl from "@/components/NovaOwl";
import WorldMap from "@/components/WorldMap";
import MissionCard from "@/components/MissionCard";
import ParentDashboard from "@/components/ParentDashboard";
import RewardBadge from "@/components/RewardBadge";
import spaceBg from "@/assets/space-bg.jpg";

type Tab = "welcome" | "map" | "mission" | "dashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("welcome");

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "welcome", label: "Home", icon: Rocket },
    { id: "map", label: "Map", icon: Map },
    { id: "mission", label: "Mission", icon: Gamepad2 },
    { id: "dashboard", label: "Parent", icon: BarChart3 },
  ];

  return (
    <div className="star-field flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-accent" />
          <h1 className="font-display text-xl text-foreground">SparkMind</h1>
        </div>
        <RewardBadge coins={45} xp={120} />
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center gap-6 text-center"
            >
              <NovaOwl size="lg" message="Welcome back, Explorer! Ready for today's mission? 🚀" />

              <div className="mt-4 max-w-sm">
                <h2 className="mb-2 font-display text-3xl leading-tight text-foreground">
                  Think. Solve. <span className="text-primary">Explore.</span>
                </h2>
                <p className="font-body text-sm text-muted-foreground">
                  Train your brain with fun space missions guided by Nova Owl!
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("map")}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-lg"
                style={{ boxShadow: "var(--shadow-glow-teal)" }}
              >
                <Rocket className="h-5 w-5" />
                Start Mission
              </motion.button>

              {/* Space background preview */}
              <div className="mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-border shadow-xl">
                <img src={spaceBg} alt="Space adventure" className="h-40 w-full object-cover" />
              </div>
            </motion.div>
          )}

          {activeTab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <h2 className="mb-4 text-center font-display text-2xl text-foreground">Mission Planet</h2>
              <WorldMap />
            </motion.div>
          )}

          {activeTab === "mission" && (
            <motion.div
              key="mission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <h2 className="mb-6 font-display text-2xl text-foreground">Active Mission</h2>
              <MissionCard />
            </motion.div>
          )}

          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <ParentDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="relative z-10 border-t border-border bg-card/80 backdrop-blur-lg">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-body text-xs font-semibold">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 h-0.5 w-12 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
