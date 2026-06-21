import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Shuffle } from "lucide-react";
import { ChampionCard } from "@/components/ChampionCard";
import { ClassFilterChip } from "@/components/ClassFilterChip";
import { StatsBar } from "@/components/StatsBar";
import { Champion } from "@/types/champion";
import championsData from "@/data/champions.json";
import { CLASS_COLORS, ChampionClass } from "@/utils/classColors";

const allChampions: Champion[] = championsData;

export default function RosterPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeClass, setActiveClass] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Name A-Z");
  const [releaseYear, setReleaseYear] = useState<string>("All");

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allChampions.forEach(c => {
      const year = new Date(c.release_date).getFullYear().toString();
      if (!isNaN(Number(year))) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, []);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(CLASS_COLORS).forEach(cls => counts[cls] = 0);
    allChampions.forEach(c => {
      if (counts[c.class] !== undefined) {
        counts[c.class]++;
      }
    });
    return counts;
  }, []);

  const filteredChampions = useMemo(() => {
    let filtered = allChampions;

    if (activeClass !== "All") {
      filtered = filtered.filter(c => c.class === activeClass);
    }

    if (releaseYear !== "All") {
      filtered = filtered.filter(c => new Date(c.release_date).getFullYear().toString() === releaseYear);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "Name A-Z":
          return a.name.localeCompare(b.name);
        case "Name Z-A":
          return b.name.localeCompare(a.name);
        case "Newest first":
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        case "Oldest first":
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, activeClass, sortBy, releaseYear]);

  const handleRandomChampion = () => {
    if (filteredChampions.length > 0) {
      const random = filteredChampions[Math.floor(Math.random() * filteredChampions.length)];
      setLocation(`/champion/${random.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="pt-12 pb-6 px-4 text-center border-b border-border/40 relative overflow-hidden bg-card/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(123,47,247,0.1)_0%,rgba(0,0,0,0)_50%)] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(123,47,247,0.5)] mb-4">
          MCOC Champion Roster
        </h1>
      </header>

      <StatsBar stats={stats} />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl flex flex-col gap-8">
        
        {/* Controls */}
        <div className="flex flex-col gap-6 bg-card/40 p-6 rounded-xl border border-border/50 shadow-lg">
          {/* Top row: Search & Random */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                data-testid="search-input"
                placeholder="Search champions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-md py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase tracking-wider"
              />
            </div>
            
            <button
              onClick={handleRandomChampion}
              data-testid="btn-random-champion"
              className="w-full md:w-auto px-6 py-2.5 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 rounded-md font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(123,47,247,0.3)]"
            >
              <Shuffle className="w-4 h-4" />
              Random Champion
            </button>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <ClassFilterChip
                name="All"
                isActive={activeClass === "All"}
                onClick={() => setActiveClass("All")}
              />
              {Object.keys(CLASS_COLORS).map((cls) => (
                <ClassFilterChip
                  key={cls}
                  name={cls}
                  isActive={activeClass === cls}
                  onClick={() => setActiveClass(cls)}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto">
              <span className="text-sm font-bold uppercase text-muted-foreground whitespace-nowrap">Year:</span>
              <select
                data-testid="year-filter-dropdown"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider outline-none focus:border-primary w-full md:w-32 appearance-none cursor-pointer"
              >
                <option value="All">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto">
              <span className="text-sm font-bold uppercase text-muted-foreground whitespace-nowrap">Sort By:</span>
              <select
                data-testid="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider outline-none focus:border-primary w-full md:w-48 appearance-none cursor-pointer"
              >
                <option value="Name A-Z">Name A-Z</option>
                <option value="Name Z-A">Name Z-A</option>
                <option value="Newest first">Newest First</option>
                <option value="Oldest first">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="text-center md:text-left">
          <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
            Showing <span className="text-white">{filteredChampions.length}</span> {activeClass !== "All" ? activeClass : ""} Champions
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredChampions.map((champion, idx) => (
              <motion.div
                key={champion.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
              >
                <ChampionCard champion={champion} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredChampions.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="text-6xl text-muted-foreground/30 mb-4 font-serif">?</div>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground">No Champions Found</h2>
          </div>
        )}
      </main>

      <footer className="py-8 text-center border-t border-border/50 bg-card/30">
        <p className="text-xs text-muted-foreground/60 max-w-2xl mx-auto px-4 uppercase tracking-wider">
          This is an unofficial fan project. Marvel Contest of Champions, all champion names, and related content are trademarks of Kabam Games, Inc. This site is not affiliated with, endorsed by, or sponsored by Marvel, Disney, or Kabam.
        </p>
      </footer>
    </div>
  );
}
