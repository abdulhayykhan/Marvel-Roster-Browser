import React from "react";
import { CLASS_COLORS } from "@/utils/classColors";
import { cn } from "@/lib/utils";

interface ClassFilterChipProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export function ClassFilterChip({ name, isActive, onClick }: ClassFilterChipProps) {
  const color = name === "All" ? "#e8e8f0" : (CLASS_COLORS[name as keyof typeof CLASS_COLORS] || "#e8e8f0");
  
  const isCombined = name === "Combined";

  return (
    <button
      data-testid={`filter-${name.toLowerCase()}`}
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2",
        isActive ? "text-white" : "text-muted-foreground bg-card/50",
        isCombined && isActive ? "combined-border bg-card" : ""
      )}
      style={!isCombined ? {
        borderColor: isActive ? color : "transparent",
        backgroundColor: isActive ? color : undefined,
        boxShadow: isActive ? `0 0 12px ${color}80` : "none",
      } : {
        borderColor: isActive ? "transparent" : "transparent"
      }}
    >
      {name}
    </button>
  );
}
