import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MissionNode from "./MissionNode";
import NovaOwl from "./NovaOwl";

const missions = [
  { id: 1, title: "Star Path", status: "completed" as const, x: 20, y: 85, color: "hsl(170, 70%, 45%)" },
  { id: 2, title: "Light Bridge", status: "completed" as const, x: 40, y: 75, color: "hsl(170, 70%, 45%)" },
  { id: 3, title: "Moon Puzzle", status: "completed" as const, x: 65, y: 80, color: "hsl(170, 70%, 45%)" },
  { id: 4, title: "Nebula Sort", status: "available" as const, x: 80, y: 65, color: "hsl(45, 95%, 58%)" },
  { id: 5, title: "Comet Trail", status: "available" as const, x: 55, y: 55, color: "hsl(45, 95%, 58%)" },
  { id: 6, title: "Galaxy Grid", status: "locked" as const, x: 30, y: 50, color: "hsl(260, 60%, 55%)" },
  { id: 7, title: "Orbit Plan", status: "locked" as const, x: 15, y: 38, color: "hsl(260, 60%, 55%)" },
  { id: 8, title: "Black Hole", status: "locked" as const, x: 45, y: 30, color: "hsl(330, 70%, 60%)" },
  { id: 9, title: "Warp Jump", status: "locked" as const, x: 70, y: 22, color: "hsl(330, 70%, 60%)" },
  { id: 10, title: "Nova Burst", status: "locked" as const, x: 50, y: 10, color: "hsl(25, 90%, 55%)" },
];

const WorldMap = () => {
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  return (
    <div className="star-field relative h-[600px] w-full overflow-hidden rounded-2xl border border-border bg-background">
      {/* Curved path connecting missions */}
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(170, 70%, 45%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(260, 60%, 55%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(260, 60%, 55%)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M20,85 Q30,80 40,75 Q52,78 65,80 Q72,72 80,65 Q68,60 55,55 Q42,52 30,50 Q22,44 15,38 Q30,34 45,30 Q57,26 70,22 Q60,16 50,10"
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeDasharray="8 6"
          vectorEffect="non-scaling-stroke"
          transform="scale(1)"
          style={{ transform: "scale(1)" }}
        />
      </svg>

      {/* Mission nodes */}
      <div className="relative h-full w-full" style={{ zIndex: 2 }}>
        {missions.map((mission, i) => (
          <MissionNode
            key={mission.id}
            title={mission.title}
            status={mission.status}
            position={{ x: mission.x, y: mission.y }}
            color={mission.color}
            delay={i * 0.1}
            onClick={() => setSelectedMission(mission.id)}
          />
        ))}
      </div>

      {/* Nova Owl floating */}
      <div className="absolute bottom-4 right-4" style={{ zIndex: 3 }}>
        <NovaOwl size="sm" message={selectedMission ? "Let's go!" : "Pick a mission!"} />
      </div>
    </div>
  );
};

export default WorldMap;
