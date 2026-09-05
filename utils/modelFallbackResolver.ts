import { useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const AWS_CDN_BASE = process.env.NEXT_PUBLIC_3D_CDN_URL || "https://d2bzch6iq8q85.cloudfront.net";
const AWS_S3_BASE = process.env.NEXT_PUBLIC_S3_MODELS_URL || "https://paintit-3d-models-prod.s3.amazonaws.com";

/**
 * Resolves 3D model URLs across AWS CloudFront, AWS S3, and local public directory.
 */
export function getModelUrls(rawUrl: string): { primaryUrl: string; s3Url: string; fallbackUrl: string } {
  if (!rawUrl) return { primaryUrl: "/models/selfcon.glb", s3Url: "https://paintit-3d-models-prod.s3.amazonaws.com/models/selfcon.glb", fallbackUrl: "/models/selfcon.glb" };

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return { primaryUrl: rawUrl, s3Url: rawUrl, fallbackUrl: rawUrl };
  }

  const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  const fullPath = cleanPath.startsWith("/models/") ? cleanPath : `/models${cleanPath}`;

  const primaryUrl = `${AWS_CDN_BASE}${fullPath}`;
  const s3Url = `${AWS_S3_BASE}${fullPath}`;
  const fallbackUrl = fullPath;

  return { primaryUrl, s3Url, fallbackUrl };
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
