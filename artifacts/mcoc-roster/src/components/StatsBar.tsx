import React from "react";
import { CLASS_COLORS, ChampionClass } from "@/utils/classColors";

interface StatsBarProps {
  stats: Record<string, number>;
}

export function StatsBar({ stats }: StatsBarProps) {
  const classes: ChampionClass[] = ["Cosmic", "Tech", "Mutant", "Skill", "Science", "Mystic", "Combined"];

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 py-2 border-y border-border/50 bg-card/30">
      {classes.map((cls) => {
        if (stats[cls] === undefined) return null;
        const color = CLASS_COLORS[cls];
        return (
          <div key={cls} className="flex items-center gap-1.5 text-xs md:text-sm font-semibold uppercase tracking-wider">
            {cls === "Combined" ? (
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary via-secondary to-accent" style={{ background: "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)" }} />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            )}
            <span className="text-muted-foreground">{cls}:</span>
            <span style={{ color: cls === "Combined" ? "white" : color }}>{stats[cls]}</span>
          </div>
        );
      })}
    </div>
  );
}
