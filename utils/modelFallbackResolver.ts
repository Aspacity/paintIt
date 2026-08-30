import { useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const AWS_CDN_BASE = process.env.NEXT_PUBLIC_3D_CDN_URL || "https://d2bzch6iq8q85.cloudfront.net";

/**
 * Resolves 3D model URLs with AWS CloudFront as Primary and GitHub/local path as Fallback.
 * 1. First Attempt: AWS CloudFront CDN (e.g. https://d2bzch6iq8q85.cloudfront.net/models/shells/spacious-lux.glb)
 * 2. Second Attempt (Fallback): GitHub local path (e.g. /models/shells/spacious-lux.glb)
 */
export function getModelUrls(rawUrl: string): { primaryUrl: string; fallbackUrl: string } {
  if (!rawUrl) return { primaryUrl: "", fallbackUrl: "" };

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    if (rawUrl.includes("cloudfront.net")) {
      try {
        const urlObj = new URL(rawUrl);
        return { primaryUrl: rawUrl, fallbackUrl: urlObj.pathname };
      } catch {
        return { primaryUrl: rawUrl, fallbackUrl: rawUrl };
      }
    }
    return { primaryUrl: rawUrl, fallbackUrl: rawUrl };
  }

  const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  const primaryUrl = `${AWS_CDN_BASE}${cleanPath}`;
  const fallbackUrl = cleanPath;

  return { primaryUrl, fallbackUrl };
}

/**
 * Custom R3F Hook that tries loading from AWS CloudFront first, falling back to GitHub local path if AWS fails.
 */
export function useGLTFWithFallback(rawUrl: string): { scene: THREE.Group; materials?: Record<string, THREE.Material>; activeUrl: string } {
  const { primaryUrl, fallbackUrl } = getModelUrls(rawUrl);
  const [activeUrl, setActiveUrl] = useState<string>(primaryUrl);
  const [hasTriedFallback, setHasTriedFallback] = useState<boolean>(false);

  useEffect(() => {
    setActiveUrl(primaryUrl);
    setHasTriedFallback(false);
  }, [primaryUrl]);

  try {
    const gltf = useGLTF(activeUrl) as unknown as { scene: THREE.Group; materials?: Record<string, THREE.Material> };
    return { scene: gltf.scene, materials: gltf.materials, activeUrl };
  } catch (error) {
    if (!hasTriedFallback && activeUrl !== fallbackUrl) {
      console.warn(`⚠️ AWS CDN model load failed for [${activeUrl}]. Falling back to GitHub local path [${fallbackUrl}]...`);
      setActiveUrl(fallbackUrl);
      setHasTriedFallback(true);
      const fallbackGltf = useGLTF(fallbackUrl) as unknown as { scene: THREE.Group; materials?: Record<string, THREE.Material> };
      return { scene: fallbackGltf.scene, materials: fallbackGltf.materials, activeUrl: fallbackUrl };
    }
    throw error;
  }
}
