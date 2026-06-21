import { useState } from "react";
import { Champion } from "@/types/champion";
import { CLASS_COLORS } from "@/utils/classColors";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import portraitUrls from "@/data/portraitUrls.json";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface ChampionCardProps {
  champion: Champion;
  index?: number;
}

const HEX_CLIP = "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)";

function getInitials(name: string): string {
  const baseName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  const words = baseName.split(/[\s-]+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function ChampionCard({ champion, index = 0 }: ChampionCardProps) {
  const isCombined = champion.class === "Combined";
  const color = CLASS_COLORS[champion.class as keyof typeof CLASS_COLORS] || "#ffffff";
  const initials = getInitials(champion.name);
  const imageUrl = getProxiedImageUrl((portraitUrls as Record<string, string>)[champion.id]);
  const [imgError, setImgError] = useState(false);
  const showFallback = !imageUrl || imgError;

  return (
    <Link href={`/champion/${champion.id}`}>
      <motion.div
        data-testid={`card-${champion.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: Math.min(index * 0.025, 0.5),
          ease: "easeOut",
        }}
        whileHover={{
          scale: 1.03,
          transition: { duration: 0.15 },
        }}
        whileTap={{
          scale: 0.97,
          transition: { duration: 0.08 },
        }}
        className={cn(
          "group relative flex flex-col rounded-lg overflow-hidden cursor-pointer bg-[#12121c]",
          isCombined && "combined-border"
        )}
        style={!isCombined ? {
          border: `1px solid ${color}44`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4)`,
        } : {
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Hover glow — intensifies on hover */}
        {!isCombined && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
            style={{
              boxShadow: `inset 0 0 30px ${color}30, 0 0 20px ${color}25`,
            }}
          />
        )}
        {isCombined && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
            style={{
              boxShadow: `inset 0 0 30px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.15)`,
            }}
          />
        )}

        {/* Diagonal class banner in top-right corner */}
        <div
          className="absolute top-2 -right-6 z-20 w-24 text-center py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-md"
          style={{
            background: isCombined
              ? "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)"
              : color,
            transform: "rotate(45deg)",
            transformOrigin: "center",
            boxShadow: isCombined
              ? "0 0 8px rgba(255,255,255,0.3)"
              : `0 0 8px ${color}66`,
          }}
        >
          {champion.class}
        </div>

        {/* Hexagon Portrait Container */}
        <div className="relative mx-auto mt-5 w-[75%] aspect-[1/1.1] flex items-center justify-center">
          {/* Radial glow behind hexagon */}
          <div
            className="absolute inset-0 opacity-20 blur-2xl pointer-events-none"
            style={{
              background: isCombined
                ? "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 70%)"
                : `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
            }}
          />

          {/* Gradient background behind hexagon (visible at clipped edges) */}
          <div
            className="absolute inset-0"
            style={{
              background: isCombined
                ? "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)"
                : `linear-gradient(135deg, ${color}cc, ${color}66)`,
              clipPath: HEX_CLIP,
            }}
          />

          {/* Hexagon portrait / initials */}
          <div
            className="absolute inset-[3px] bg-[#0a0a0f] overflow-hidden"
            style={{ clipPath: HEX_CLIP }}
          >
            {/* Inner glow for initials */}
            {showFallback && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: isCombined
                    ? "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)"
                    : color,
                }}
              />
            )}

            {showFallback ? (
              <span
                className="absolute inset-0 flex items-center justify-center text-3xl font-black z-10 drop-shadow-lg"
                style={isCombined ? {
                  background: "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                } : { color }}
              >
                {initials}
              </span>
            ) : (
              <img
                src={imageUrl}
                alt={champion.name}
                className="absolute inset-0 w-full h-full object-cover object-top z-10"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Info Area */}
        <div className="p-3 pt-2 flex flex-col items-center text-center flex-grow">
          <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2 uppercase tracking-wide">
            {champion.name}
          </h3>
          <span className="text-[10px] text-muted-foreground uppercase opacity-70 tracking-wider">
            {champion.release_date}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
