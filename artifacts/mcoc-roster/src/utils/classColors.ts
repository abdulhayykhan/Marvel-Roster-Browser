export const CLASS_COLORS = {
  Cosmic: "#7B2FF7",
  Tech: "#00C2FF",
  Mutant: "#FFC107",
  Skill: "#E53935",
  Science: "#43A047",
  Mystic: "#D81B60",
  Combined: "transparent" // Handled via CSS gradient
} as const;

export type ChampionClass = keyof typeof CLASS_COLORS;

export function getClassColor(className: string): string {
  return CLASS_COLORS[className as ChampionClass] || "#ffffff";
}
