export type PaintFinish = "gloss" | "metallic" | "matte";

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  finish: PaintFinish;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  priceDelta: number;
}

export interface WheelOption {
  id: string;
  name: string;
  finishHex: string;
  roughness: number;
  metalness: number;
  description: string;
  priceDelta: number;
}

export interface CaliperOption {
  id: string;
  name: string;
  hex: string;
  priceDelta: number;
}

export type CameraPreset = "exterior" | "side" | "wheel" | "rear" | "top";

export type StudioEnvironment = "dark-showroom" | "warm-studio" | "sunset-outdoor" | "pure-white";

export interface CustomModelData {
  name: string;
  url: string;
  extension: "glb" | "gltf" | "fbx";
  buffer?: ArrayBuffer;
  filesMap?: Record<string, string>;
}

export interface CarConfigState {
  // Paint
  selectedColor: ColorOption;
  selectedFinish: PaintFinish;
  
  // Wheels & Brakes
  selectedWheel: WheelOption;
  selectedCaliper: CaliperOption;
  
  // Aero & Carbon
  carbonPackage: boolean;
  carbonSpoiler: boolean;
  
  // Lights & Effects
  headlightsOn: boolean;
  hazardLightsOn: boolean;
  
  // View & Environment
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  studioEnv: StudioEnvironment;
  
  // Pricing
  basePrice: number;
}

export const PAINT_COLORS: ColorOption[] = [
  {
    id: "rosso-corsa",
    name: "Apex Crimson Red",
    hex: "#c40d1e",
    finish: "gloss",
    roughness: 0.15,
    metalness: 0.75,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 0
  },
  {
    id: "monaco-blue",
    name: "Monaco Racing Blue",
    hex: "#0b396b",
    finish: "metallic",
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    priceDelta: 1200
  },
  {
    id: "obsidian-black",
    name: "Obsidian Deep Black",
    hex: "#101013",
    finish: "gloss",
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    priceDelta: 800
  },
  {
    id: "nardo-grey",
    name: "Nardo Stealth Grey",
    hex: "#6b7280",
    finish: "gloss",
    roughness: 0.25,
    metalness: 0.4,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    priceDelta: 1500
  },
  {
    id: "acid-green",
    name: "Acid Hyper Green",
    hex: "#55d600",
    finish: "gloss",
    roughness: 0.15,
    metalness: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 2000
  },
  {
    id: "matte-graphite",
    name: "Frozen Satin Graphite",
    hex: "#2d3139",
    finish: "matte",
    roughness: 0.65,
    metalness: 0.5,
    clearcoat: 0.1,
    clearcoatRoughness: 0.4,
    priceDelta: 2500
  },
  {
    id: "pearl-white",
    name: "Bianco Pearl White",
    hex: "#f3f4f6",
    finish: "metallic",
    roughness: 0.18,
    metalness: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 1000
  },
  {
    id: "racing-gold",
    name: "Formula Gold Metallic",
    hex: "#c69214",
    finish: "metallic",
    roughness: 0.22,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 3200
  },
  {
    id: "miami-cyan",
    name: "Miami Cyan",
    hex: "#00d2eb",
    finish: "gloss",
    roughness: 0.15,
    metalness: 0.7,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 2200
  },
  {
    id: "british-green",
    name: "British Racing Green",
    hex: "#0c3b24",
    finish: "metallic",
    roughness: 0.2,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    priceDelta: 2800
  },
  {
    id: "solar-orange",
    name: "Solar Sunburst Orange",
    hex: "#ff5500",
    finish: "gloss",
    roughness: 0.14,
    metalness: 0.75,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    priceDelta: 2400
  },
  {
    id: "royal-violet",
    name: "Royal Violet Metallic",
    hex: "#4c1d95",
    finish: "metallic",
    roughness: 0.18,
    metalness: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    priceDelta: 3000
  }
];

export const WHEEL_OPTIONS: WheelOption[] = [
  {
    id: "satin-black",
    name: "Forged Track R (Satin Black)",
    finishHex: "#1a1a1c",
    roughness: 0.4,
    metalness: 0.85,
    description: "Lightweight monoblock satin black finish",
    priceDelta: 0
  },
  {
    id: "diamond-silver",
    name: "Series R (Diamond Cut Silver)",
    finishHex: "#d1d5db",
    roughness: 0.15,
    metalness: 0.95,
    description: "Machined high-polish aerospace alloy",
    priceDelta: 1800
  },
  {
    id: "matte-bronze",
    name: "Apex GT (Motorsport Bronze)",
    finishHex: "#785834",
    roughness: 0.35,
    metalness: 0.9,
    description: "Dakar motorsport matte bronze powder-coat",
    priceDelta: 2400
  },
  {
    id: "hyper-chrome",
    name: "Shadow Mirror Chrome",
    finishHex: "#9ca3af",
    roughness: 0.05,
    metalness: 1.0,
    description: "Ultra-reflective liquid chrome finish",
    priceDelta: 3000
  }
];

export const CALIPER_OPTIONS: CaliperOption[] = [
  { id: "brembo-red", name: "Brembo Race Red", hex: "#dc2626", priceDelta: 0 },
  { id: "acid-yellow", name: "Carbon Ceramic Yellow", hex: "#eab308", priceDelta: 450 },
  { id: "acid-green", name: "Acid Lime Green", hex: "#84cc16", priceDelta: 450 },
  { id: "monaco-blue", name: "Electric Blue", hex: "#2563eb", priceDelta: 450 },
  { id: "stealth-black", name: "Stealth Gloss Black", hex: "#18181b", priceDelta: 200 }
];

export const CAMERA_CONFIGS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  exterior: { pos: [3.8, 1.4, 4.0], target: [0, 0.4, 0] },
  side: { pos: [0.1, 0.95, 4.6], target: [0, 0.4, 0] },
  wheel: { pos: [1.9, 0.65, 2.3], target: [1.1, 0.4, 1.4] },
  rear: { pos: [-3.4, 1.3, -3.8], target: [0, 0.45, 0] },
  top: { pos: [0.1, 5.5, 0.5], target: [0, 0, 0] }
};
