import type { WorldTone } from "@/components/WorldCard";

export const WORLD_ASSETS = {
  botany: "/manus-storage/botany-rainforest_def7888b.jpg",
  aquarium: "/manus-storage/aquarium-planted_42d3639b.jpg",
  terrarium: "/manus-storage/terrarium-moss_9eba1fa1.jpg",
} as const;

// The design handoff supplies these original, stable motif assets for the
// interactive reference layouts. They are imagery only; all readings and
// application state remain sourced from the real app data paths.
export const REFERENCE_ASSETS = {
  botany: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/qmloFTGSjCFRoVJv.jpg",
  aquarium: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/IdfRorWpbjjRkmWY.jpg",
  terrarium: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/JyzIvRjtPdIvwWWD.jpg",
  ai: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/PSZueuRMSmSZbPaL.jpg",
} as const;

export const WORLD_CONFIG: Array<{
  number: string;
  realm: WorldTone;
  imageUrl: string;
  href: string;
  titleKey: "world.botany.title" | "world.aquarium.title" | "world.terrarium.title" | "world.assistant.title";
  subtitleKey: "world.botany.subtitle" | "world.aquarium.subtitle" | "world.terrarium.subtitle" | "world.assistant.subtitle";
}> = [
  { number: "01", realm: "botany", imageUrl: WORLD_ASSETS.botany, href: "/world/botany", titleKey: "world.botany.title", subtitleKey: "world.botany.subtitle" },
  { number: "02", realm: "aquarium", imageUrl: WORLD_ASSETS.aquarium, href: "/world/aquarium", titleKey: "world.aquarium.title", subtitleKey: "world.aquarium.subtitle" },
  { number: "03", realm: "terrarium", imageUrl: WORLD_ASSETS.terrarium, href: "/world/terrarium", titleKey: "world.terrarium.title", subtitleKey: "world.terrarium.subtitle" },
  { number: "04", realm: "assistant", imageUrl: WORLD_ASSETS.botany, href: "/assistant", titleKey: "world.assistant.title", subtitleKey: "world.assistant.subtitle" },
];
