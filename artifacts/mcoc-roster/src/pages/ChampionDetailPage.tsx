import React from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import championsData from "@/data/champions.json";
import { Champion } from "@/types/champion";
import { CLASS_COLORS } from "@/utils/classColors";
import { cn } from "@/lib/utils";

const allChampions: Champion[] = championsData;

function generateFlavorText(name: string, championClass: string) {
  const flavors: Record<string, string[]> = {
    Cosmic: [
      `A being of immense celestial power. ${name} traverses the stars, bending cosmic energy to their will and striking with the force of a supernova.`,
      `Forged in the outer reaches of the galaxy, ${name} harnesses alien technology and raw stellar power to conquer any opponent in The Contest.`,
    ],
    Tech: [
      `Equipped with cutting-edge cybernetics and advanced weaponry. ${name} calculates every variable to execute the perfect tactical strike.`,
      `A master of engineering and robotics. ${name}'s augmented armor and digital enhancements make them a devastating force on the Battlerealm.`,
    ],
    Mutant: [
      `Born with the extraordinary X-gene, ${name} commands unique and terrifying abilities that set them apart from ordinary humanity.`,
      `An evolution of mankind. ${name} leverages their innate genetic gifts to overwhelm their foes with raw, untamed mutant power.`,
    ],
    Skill: [
      `A master of martial arts and lethal weaponry. ${name} relies on relentless training and killer instincts rather than superpowers.`,
      `Trained to perfection, ${name} strikes with pinpoint accuracy. Their unparalleled combat prowess makes them a deadly opponent in close quarters.`,
    ],
    Science: [
      `Transformed by radical experiments and radioactive exposure, ${name} possesses volatile and monstrous physical capabilities.`,
      `A product of dangerous lab accidents and genetic modification. ${name} unleashes chemical fury and unnatural strength upon their enemies.`,
    ],
    Mystic: [
      `A wielder of the dark arts and ancient sorcery. ${name} channels ethereal magic to bend reality and shatter their opponent's soul.`,
      `Bound to supernatural forces, ${name} commands mystical energies that defy the laws of physics, draining the life from their adversaries.`,
    ],
    Combined: [
      `A terrifying fusion of multiple classes. ${name} embodies a chaotic amalgam of powers, breaking the rules of The Contest itself.`,
      `An anomalous entity in the Battlerealm, ${name} synergizes conflicting energies into a singular, devastating threat.`
    ]
  };

  const options = flavors[championClass] || flavors.Skill;
  // Use character name length to deterministically pick an option
  return options[name.length % options.length];
}

function getInitials(name: string): string {
  const baseName = name.replace(/\s*\(.*?\)\s*/g, '').trim();
  const words = baseName.split(/[\s-]+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function ChampionDetailPage() {
  const params = useParams();
  const champion = allChampions.find(c => c.id === params.id);

  if (!champion) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
        <div className="text-8xl text-destructive mb-4 font-serif">!</div>
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest font-serif mb-6">
          Champion Not Found
        </h1>
        <Link href="/">
          <button data-testid="btn-back" className="px-6 py-3 bg-card border border-border hover:bg-muted text-white uppercase tracking-widest font-bold rounded-md flex items-center gap-2 transition-all">
            <ArrowLeft className="w-5 h-5" />
            Return to Roster
          </button>
        </Link>
      </div>
    );
  }

  const isCombined = champion.class === "Combined";
  const color = CLASS_COLORS[champion.class as keyof typeof CLASS_COLORS] || "#ffffff";
  const initials = getInitials(champion.name);
  const flavorText = generateFlavorText(champion.name, champion.class);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none blur-[100px] rounded-full"
        style={{ 
          background: isCombined 
            ? "radial-gradient(circle, #7B2FF7, #00C2FF, transparent)" 
            : `radial-gradient(circle, ${color}, transparent)` 
        }}
      />

      {/* Nav */}
      <nav className="p-4 relative z-10 flex items-center max-w-6xl mx-auto w-full">
        <Link href="/">
          <button data-testid="btn-back" className="px-4 py-2 bg-card/80 border border-border/50 hover:bg-muted/80 text-white uppercase tracking-widest text-sm font-bold rounded-md flex items-center gap-2 backdrop-blur-sm transition-all shadow-lg">
            <ArrowLeft className="w-4 h-4" />
            Roster
          </button>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Col: Giant Initials Display */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-1/3 aspect-[3/4] relative rounded-2xl overflow-hidden bg-[#050508] border-2 shadow-2xl flex items-center justify-center"
          style={!isCombined ? {
            borderColor: color,
            boxShadow: `0 0 40px ${color}4d, inset 0 0 80px ${color}33`,
          } : {}}
        >
          {isCombined && <div className="absolute inset-0 combined-border opacity-50 pointer-events-none" />}
          
          <div 
            className="absolute inset-0 opacity-40 blur-xl"
            style={{
              background: isCombined 
                ? "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 70%)" 
                : `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`
            }}
          />
          <span 
            className="text-[12rem] md:text-[16rem] font-serif font-black z-10 drop-shadow-2xl leading-none"
            style={isCombined ? { 
              background: "linear-gradient(45deg, #7B2FF7, #00C2FF, #FFC107, #E53935, #43A047, #D81B60)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            } : { color, textShadow: `0 0 30px ${color}80` }}
          >
            {initials}
          </span>
        </motion.div>

        {/* Right Col: Details */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-2/3 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <span 
              className={cn(
                "inline-block px-3 py-1 rounded-sm text-sm font-bold uppercase tracking-widest w-max shadow-lg",
                isCombined ? "bg-gradient-to-r from-primary via-secondary to-accent text-white" : ""
              )}
              style={!isCombined ? { backgroundColor: color, color: "#fff", boxShadow: `0 0 15px ${color}66` } : {}}
            >
              {champion.class}
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider text-white font-serif leading-tight">
              {champion.name}
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest font-semibold mt-2 text-lg">
              Released: <span className="text-foreground">{champion.release_date}</span>
            </p>
          </div>

          <div className="bg-card/50 border border-border/50 p-6 rounded-xl backdrop-blur-sm shadow-xl">
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium italic">
              "{flavorText}"
            </p>
          </div>

          {/* Locked Panel */}
          <div className="relative mt-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-muted to-card rounded-xl border-2 border-border opacity-50" />
            <div className="relative bg-[#0a0a0f]/80 p-8 md:p-12 rounded-xl border-2 border-border/80 flex flex-col items-center text-center gap-4 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
              
              {/* Scanning line effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 shadow-[0_0_10px_rgba(123,47,247,0.5)] animate-[scan_3s_linear_infinite]" />
              
              <Lock className="w-12 h-12 text-muted-foreground mb-2" />
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white/50 font-serif">
                Full Profile Coming Soon
              </h2>
              <p className="text-muted-foreground/80 max-w-md mx-auto uppercase tracking-wider font-semibold text-sm">
                Detailed abilities, synergies, and tier data coming in a future update.
              </p>
              
              <div className="mt-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-border animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-border animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-border animate-pulse delay-150" />
              </div>
            </div>
          </div>

        </motion.div>
      </main>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500px); }
        }
      `}</style>
    </div>
  );
}
