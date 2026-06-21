import React from "react";
import { CLASS_COLORS } from "@/utils/classColors";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Flame, Eye, Star } from "lucide-react";
import { FaPaw, FaAtom } from "react-icons/fa6";

interface ClassFilterChipProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const classIcons: Record<string, React.ReactNode> = {
  "All": null,
  "Cosmic": <Sparkles className="w-4 h-4" />,
  "Tech": <Zap className="w-4 h-4" />,
  "Mutant": <FaPaw className="w-4 h-4" />,
  "Skill": <Flame className="w-4 h-4" />,
  "Science": <FaAtom className="w-4 h-4" />,
  "Mystic": <Eye className="w-4 h-4" />,
  "Combined": <Star className="w-4 h-4" />,
};

export function ClassFilterChip({ name, isActive, onClick }: ClassFilterChipProps) {
  const color = name === "All" ? "#e8e8f0" : (CLASS_COLORS[name as keyof typeof CLASS_COLORS] || "#e8e8f0");
  const isCombined = name === "Combined";
  const icon = classIcons[name] || null;

  return (
    <button
      data-testid={`filter-${name.toLowerCase()}`}
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 flex items-center gap-2",
        isActive ? "text-white" : "text-muted-foreground bg-card/50",
        isCombined && isActive ? "combined-border bg-card" : ""
      )}
      style={!isCombined ? {
        borderColor: isActive ? color : "transparent",
        backgroundColor: isActive ? color : undefined,
        boxShadow: isActive ? `0 0 12px ${color}80` : "none",
      } : {
        borderColor: isActive ? "transparent" : "transparent",
        boxShadow: isActive ? "0 0 12px rgba(255,255,255,0.3)" : "none",
      }}
    >
      {icon && (
        <span className={isActive ? "text-white" : ""} style={!isActive ? { color } : {}}>
          {icon}
        </span>
      )}
      {name}
    </button>
  );
}
