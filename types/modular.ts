export type AssetCategory = 'shells' | 'seating' | 'tables' | 'storage' | 'decor' | 'wall_panels' | 'lighting';

export interface CatalogAsset {
  id: string;
  name: string;
  category: AssetCategory;
  model_url: string;
  thumbnail_url?: string;
  default_scale?: [number, number, number];
}

export interface PlacedObjectTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface ComponentSubMeshMaterial {
  meshName: string;
  materialName: string;
  currentColor: string;
  currentTexture?: string;
}

export interface PlacedObject {
  instance_id: string;
  asset_id: string;
  name: string;
  category: AssetCategory;
  model_url: string;
  transform: PlacedObjectTransform;
  materials?: Record<string, string>;
  textures?: Record<string, string>;
  isLocked?: boolean;
}

export interface MasterTemplateDesign {
  id: string;
  title: string;
  category?: string;
  shell_model_url: string;
  default_room_data: {
    wallFront?: string;
    wallBack?: string;
    wallLeft?: string;
    wallRight?: string;
    floor_texture?: string;
    floor_color?: string;
    ceiling?: string;
  };
  placed_objects: PlacedObject[];
  global_environment?: {
    isNightMode?: boolean;
    ambientIntensity?: number;
  };
}
