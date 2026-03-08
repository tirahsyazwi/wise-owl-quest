import { useState } from "react";
import { motion } from "framer-motion";
import MissionNode from "./MissionNode";
import NovaOwl from "./NovaOwl";
import { missionBank, Mission, getTypeColor, getZoneLabel } from "@/data/missionBank";

interface WorldMapProps {
  completedMissionIds?: string[];
  onSelectMission?: (mission: Mission) => void;
  missionLimit?: number; // -1 or undefined = unlimited
}

const WorldMap = ({ completedMissionIds = [], onSelectMission, missionLimit }: WorldMapProps) => {
  const [hoveredMission, setHoveredMission] = useState<Mission | null>(null);

  const getMissionStatus = (mission: Mission, index: number): "completed" | "available" | "locked" => {
    if (completedMissionIds.includes(mission.id)) return "completed";
    // If mission limit is set and we've hit it, lock remaining
    if (missionLimit && missionLimit > 0 && completedMissionIds.length >= missionLimit) return "locked";
    // First uncompleted mission or previous is completed
    if (index === 0) return "available";
    const prevMission = missionBank[index - 1];
    if (completedMissionIds.includes(prevMission.id)) return "available";
    return "locked";
  };

  // Zone labels
  const zones = [
    { label: getZoneLabel("arrival"), y: 84 },
    { label: getZoneLabel("foundation"), y: 58 },
    { label: getZoneLabel("strategic"), y: 38 },
    { label: getZoneLabel("adaptive"), y: 18 },
    { label: getZoneLabel("advanced"), y: 4 },
  ];

  return (
    <div className="star-field relative h-[700px] w-full overflow-hidden rounded-2xl border border-border bg-background">
      {/* Zone labels */}
      {zones.map((zone) => (
        <div
          key={zone.label}
          className="absolute left-2 z-10 rounded-lg bg-card/80 px-2 py-0.5 font-body text-[10px] font-bold text-muted-foreground backdrop-blur-sm"
          style={{ top: `${zone.y}%` }}
        >
          {zone.label}
        </div>
      ))}

      {/* Curved path */}
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="mapPathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(170, 70%, 45%)" stopOpacity="0.5" />
            <stop offset="30%" stopColor="hsl(45, 95%, 58%)" stopOpacity="0.4" />
            <stop offset="60%" stopColor="hsl(260, 60%, 55%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(25, 90%, 55%)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {missionBank.map((mission, i) => {
          if (i === 0) return null;
          const prev = missionBank[i - 1];
          return (
            <line
              key={`path-${i}`}
              x1={`${prev.mapPosition.x}%`}
              y1={`${prev.mapPosition.y}%`}
              x2={`${mission.mapPosition.x}%`}
              y2={`${mission.mapPosition.y}%`}
              stroke="url(#mapPathGradient)"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.6"
            />
          );
        })}
      </svg>

      {/* Mission nodes */}
      <div className="relative h-full w-full" style={{ zIndex: 2 }}>
        {missionBank.map((mission, i) => {
          const status = getMissionStatus(mission, i);
          return (
            <MissionNode
              key={mission.id}
              title={mission.title}
              status={status}
              position={mission.mapPosition}
              color={getTypeColor(mission.type)}
              delay={i * 0.05}
              onClick={() => {
                setHoveredMission(mission);
                if (status !== "locked" && onSelectMission) {
                  onSelectMission(mission);
                }
              }}
            />
          );
        })}
      </div>

      {/* Nova Owl with context */}
      <div className="absolute bottom-3 right-3" style={{ zIndex: 3 }}>
        <NovaOwl
          size="sm"
          message={
            hoveredMission
              ? hoveredMission.title
              : `${completedMissionIds.length}/${missionBank.length} complete!`
          }
        />
      </div>
    </div>
  );
};

export default WorldMap;
