import React from "react";
import { Champion } from "@/types/champion";
import { CLASS_COLORS } from "@/utils/classColors";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChampionCardProps {
  champion: Champion;
}

function getInitials(name: string): string {
  // Remove parenthetical variants like (Blue Team)
  const baseName = name.replace(/\s*\(.*?\)\s*/g, '').trim();
  const words = baseName.split(/[\s-]+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function ChampionCard({ champion }: ChampionCardProps) {
  const isCombined = champion.class === "Combined";
  const color = CLASS_COLORS[champion.class as keyof typeof CLASS_COLORS] || "#ffffff";
  const initials = getInitials(champion.name);

  return (
    <Link href={`/champion/${champion.id}`}>
      <motion.div
        data-testid={`card-${champion.id}`}
        whileHover={{ scale: 1.05 }}
        className={cn(
          "group relative flex flex-col h-full rounded-xl overflow-hidden cursor-pointer bg-[#12121c] border-[2px] transition-all duration-300",
          isCombined && "combined-border"
        )}
        style={!isCombined ? {
          borderColor: color,
          boxShadow: `0 0 15px ${color}4d`,
        } : {}}
      >
        {!isCombined && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `inset 0 0 25px ${color}80` }} />
        )}
        
        {/* Initials Area */}
        <div className="relative aspect-square flex items-center justify-center border-b border-white/5 overflow-hidden">
          {/* Subtle radial gradient background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: isCombined 
                ? "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 70%)" 
                : `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`
            }}
          />
          <span 
            className="text-6xl font-serif font-black z-10 drop-shadow-lg"
            style={isCombined ? { 
              background: "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            } : { color }}
          >
            {initials}
          </span>
        </div>

        {/* Info Area */}
        <div className="p-3 flex flex-col items-center text-center flex-grow">
          <h3 className="font-bold text-sm md:text-base leading-tight mb-2 line-clamp-2 uppercase">
            {champion.name}
          </h3>
          
          <div className="mt-auto flex flex-col items-center gap-1.5 w-full">
            <span 
              className={cn(
                "text-[10px] md:text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm w-full",
                isCombined && "bg-gradient-to-r from-primary via-secondary to-accent text-white"
              )}
              style={!isCombined ? { backgroundColor: color, color: "#fff" } : {}}
            >
              {champion.class}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase opacity-70">
              {champion.release_date}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
