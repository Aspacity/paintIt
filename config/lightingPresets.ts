import * as THREE from "three";

export type LightingPresetKey =
  | "dawn"
  | "morning"
  | "midday"
  | "afternoon"
  | "goldenHour"
  | "sunset"
  | "night";

export interface SunConfig {
  elevationDeg: number;  // 0° (horizon) to 90° (zenith)
  azimuthDeg: number;    // 0° to 360° (compass direction)
  color: string;
  intensity: number;
  shadowMapSize: number;
  shadowBias: number;
  shadowCameraFar: number;
}

export interface EnvironmentConfig {
  ambientColor: string;
  ambientIntensity: number;
  skyGroundColor: string;
  skySkyColor: string;
  skyIntensity: number;
  skyTurbidity: number;
  skyRayleigh: number;
  skyMieCoefficient: number;
  skyMieDirectionalG: number;
  exposure: number;
}

export interface MasterLightingPreset {
  key: LightingPresetKey;
  label: string;
  icon: string;
  sun: SunConfig;
  environment: EnvironmentConfig;
}

/**
 * Calculates 3D Cartesian coordinates [X, Y, Z] for directional sun light
 * using spherical coordinate trigonometry:
 * - Elevation (phi): vertical angle from ground plane (0° - 90°)
 * - Azimuth (theta): horizontal rotation angle (0° - 360°)
 */
export function calculateSunPosition(
  elevationDeg: number,
  azimuthDeg: number,
  radius: number = 14
): [number, number, number] {
  const phi = THREE.MathUtils.degToRad(Math.max(0.1, Math.min(89.9, elevationDeg)));
  const theta = THREE.MathUtils.degToRad(azimuthDeg);

  const x = radius * Math.cos(phi) * Math.sin(theta);
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.cos(theta);

  return [x, y, z];
}

export const MASTER_LIGHTING_PRESETS: Record<LightingPresetKey, MasterLightingPreset> = {
  dawn: {
    key: "dawn",
    label: "Dawn",
    icon: "🌅",
    sun: {
      elevationDeg: 12,
      azimuthDeg: 105,
      color: "#ffb07c",
      intensity: 1.8,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#1d263b",
      ambientIntensity: 0.35,
      skyGroundColor: "#2a1e1b",
      skySkyColor: "#ffaa77",
      skyIntensity: 0.4,
      skyTurbidity: 10,
      skyRayleigh: 2.5,
      skyMieCoefficient: 0.02,
      skyMieDirectionalG: 0.8,
      exposure: 0.85,
    },
  },
  morning: {
    key: "morning",
    label: "Morning",
    icon: "☀️",
    sun: {
      elevationDeg: 35,
      azimuthDeg: 135,
      color: "#fff4e0",
      intensity: 2.8,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#4a5e7d",
      ambientIntensity: 0.5,
      skyGroundColor: "#c8b89a",
      skySkyColor: "#cfe3f2",
      skyIntensity: 0.55,
      skyTurbidity: 6,
      skyRayleigh: 1.2,
      skyMieCoefficient: 0.01,
      skyMieDirectionalG: 0.85,
      exposure: 0.95,
    },
  },
  midday: {
    key: "midday",
    label: "Midday",
    icon: "🌤️",
    sun: {
      elevationDeg: 82,
      azimuthDeg: 195,
      color: "#ffffff",
      intensity: 3.4,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#6c82a3",
      ambientIntensity: 0.6,
      skyGroundColor: "#d2c5ae",
      skySkyColor: "#e6f2ff",
      skyIntensity: 0.65,
      skyTurbidity: 4,
      skyRayleigh: 0.8,
      skyMieCoefficient: 0.008,
      skyMieDirectionalG: 0.9,
      exposure: 1.0,
    },
  },
  afternoon: {
    key: "afternoon",
    label: "Afternoon",
    icon: "🌤️",
    sun: {
      elevationDeg: 48,
      azimuthDeg: 225,
      color: "#ffeedd",
      intensity: 3.0,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#5a6f8f",
      ambientIntensity: 0.52,
      skyGroundColor: "#c5b596",
      skySkyColor: "#d9e8f5",
      skyIntensity: 0.55,
      skyTurbidity: 5,
      skyRayleigh: 1.0,
      skyMieCoefficient: 0.01,
      skyMieDirectionalG: 0.88,
      exposure: 0.95,
    },
  },
  goldenHour: {
    key: "goldenHour",
    label: "Golden Hour",
    icon: "🌇",
    sun: {
      elevationDeg: 15,
      azimuthDeg: 255,
      color: "#ff9e42",
      intensity: 2.5,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#2d2018",
      ambientIntensity: 0.42,
      skyGroundColor: "#3d1f0d",
      skySkyColor: "#ffa952",
      skyIntensity: 0.45,
      skyTurbidity: 12,
      skyRayleigh: 3.0,
      skyMieCoefficient: 0.025,
      skyMieDirectionalG: 0.75,
      exposure: 0.9,
    },
  },
  sunset: {
    key: "sunset",
    label: "Sunset",
    icon: "🌆",
    sun: {
      elevationDeg: 5,
      azimuthDeg: 270,
      color: "#ff7043",
      intensity: 1.6,
      shadowMapSize: 2048,
      shadowBias: -0.0001,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#1a121e",
      ambientIntensity: 0.3,
      skyGroundColor: "#200b05",
      skySkyColor: "#ff5252",
      skyIntensity: 0.35,
      skyTurbidity: 14,
      skyRayleigh: 3.5,
      skyMieCoefficient: 0.03,
      skyMieDirectionalG: 0.7,
      exposure: 0.85,
    },
  },
  night: {
    key: "night",
    label: "Night",
    icon: "🌙",
    sun: {
      elevationDeg: 0,
      azimuthDeg: 45,
      color: "#4a6984",
      intensity: 0.15,
      shadowMapSize: 1024,
      shadowBias: -0.0005,
      shadowCameraFar: 25,
    },
    environment: {
      ambientColor: "#0a0f1d",
      ambientIntensity: 0.15,
      skyGroundColor: "#050810",
      skySkyColor: "#152238",
      skyIntensity: 0.15,
      skyTurbidity: 20,
      skyRayleigh: 0.2,
      skyMieCoefficient: 0.005,
      skyMieDirectionalG: 0.95,
      exposure: 0.7,
    },
  },
};
