export interface FurnishItAssetItem {
  id: string;
  name: string;
  category: "SHELLS" | "SEATING" | "TABLES" | "DECOR" | "STORAGE" | "WALL_PANELS" | "LIGHTING";
  thumbnailColor: string;
  icon: string;
  modelUrl: string;
  defaultScale: [number, number, number];
  description: string;
}

export interface RoomModelItem {
  id: string;
  name: string;
  tagline: string;
  thumbnailColor: string;
  modelUrl: string;
}

/**
 * Real Room Shell GLB Models located in public/models/shells/ & public/models/
 */
export const REAL_ROOM_SHELLS: RoomModelItem[] = [
  {
    id: "spacious_lux",
    name: "Spacious Luxury Lounge",
    tagline: "10m luxury open-plan lounge with floor cove & window daylighting",
    thumbnailColor: "#3b82f6",
    modelUrl: "/models/shells/spacious-lux.glb",
  },
  {
    id: "livingroom_window",
    name: "Living Room (Window View)",
    tagline: "Classic residential living room with double window opening",
    thumbnailColor: "#8b5cf6",
    modelUrl: "/models/shells/livingroom-shell(window).glb",
  },
  {
    id: "master_room_shell",
    name: "Master Bedroom Studio",
    tagline: "Serene bedroom layout optimized for accent wall palettes",
    thumbnailColor: "#10b981",
    modelUrl: "/models/shells/master_room_shell.glb",
  },
  {
    id: "selfcon_studio",
    name: "Self-Contained Suite",
    tagline: "Fully furnished residential studio apartment layout",
    thumbnailColor: "#f59e0b",
    modelUrl: "/models/selfcon.glb",
  },
];

/**
 * Real Furniture GLB Assets located in public/models/assets/
 */
export const REAL_FURNISH_IT_ASSETS: FurnishItAssetItem[] = [
  // 🛋️ SEATING
  {
    id: "seating_3seater_chair",
    name: "3-Seater Executive Sofa",
    category: "SEATING",
    thumbnailColor: "#475569",
    icon: "🛋️",
    modelUrl: "/models/assets/seating/3-seater-chair.glb",
    defaultScale: [1, 1, 1],
    description: "Deep-cushioned 3-seater lounge sofa",
  },
  {
    id: "seating_armchair",
    name: "Scandinavian Armchair",
    category: "SEATING",
    thumbnailColor: "#d97706",
    icon: "🪑",
    modelUrl: "/models/assets/seating/armchair.glb",
    defaultScale: [1, 1, 1],
    description: "Solid frame minimalist accent armchair",
  },
  {
    id: "seating_curved_sofa",
    name: "Modern Curved Lounge Sofa",
    category: "SEATING",
    thumbnailColor: "#0284c7",
    icon: "🛋️",
    modelUrl: "/models/assets/seating/curved-sofa.glb",
    defaultScale: [1, 1, 1],
    description: "Curved velvet modern reception lounge sofa",
  },

  // ☕ TABLES
  {
    id: "tables_table",
    name: "Minimalist Coffee Table",
    category: "TABLES",
    thumbnailColor: "#94a3b8",
    icon: "☕",
    modelUrl: "/models/assets/tables/table.glb",
    defaultScale: [1, 1, 1],
    description: "Sleek low-profile central living room table",
  },

  // 🌿 DECOR & PLANTS
  {
    id: "decor_big_cotton",
    name: "Large Cotton Foliage Planter",
    category: "DECOR",
    thumbnailColor: "#15803d",
    icon: "🌿",
    modelUrl: "/models/assets/decor/big-cotton.glb",
    defaultScale: [1, 1, 1],
    description: "Architectural floor planter with lush cotton foliage",
  },
  {
    id: "decor_cotton",
    name: "Potted Botanical Decor",
    category: "DECOR",
    thumbnailColor: "#16a34a",
    icon: "🪴",
    modelUrl: "/models/assets/decor/cotton.glb",
    defaultScale: [1, 1, 1],
    description: "Compact ceramic table plant with green leaves",
  },
];
