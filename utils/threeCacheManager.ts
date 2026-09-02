import * as THREE from "three";

/**
 * Three.js Material & Texture Cache Manager
 * 
 * Prevents redundant procedural texture canvas draws, limits GC pauses during
 * real-time wall surface recoloring, and cleanly disposes unused WebGL textures/materials.
 */
class ThreeCacheManager {
  private textureCache: Map<string, THREE.CanvasTexture> = new Map();
  private materialCache: Map<string, THREE.MeshStandardMaterial> = new Map();

  /**
   * Returns a cached procedural texture or executes generator and caches result.
   */
  public getOrCreateTexture(
    cacheKey: string,
    generator: () => HTMLCanvasElement
  ): THREE.CanvasTexture {
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const canvas = generator();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Returns a cached surface material or instantiates a new one.
   */
  public getOrCreateMaterial(
    cacheKey: string,
    factory: () => THREE.MeshStandardMaterial
  ): THREE.MeshStandardMaterial {
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    const material = factory();
    this.materialCache.set(cacheKey, material);
    return material;
  }

  /**
   * Cleanly disposes all cached textures and materials to prevent WebGL memory leaks.
   */
  public clearCache(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose();
    });
    this.textureCache.clear();

    this.materialCache.forEach((material) => {
      material.dispose();
    });
    this.materialCache.clear();
  }
}

export const threeCache = new ThreeCacheManager();
