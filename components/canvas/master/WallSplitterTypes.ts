import { WallFinishType } from "../PaintItMasterCanvas";

export type SplitType = "HORIZONTAL" | "VERTICAL" | "DIAGONAL_TL_BR" | "DIAGONAL_TR_BL";

export interface WallSegment {
  id: string; // e.g. "wall_back::seg_1"
  parentWallKey: string; // e.g. "wall_back"
  label: string; // e.g. "Back Wall (Top Section)"
  splitType?: SplitType;
  // Normalized 2D local bounds on the wall face: [-0.5 .. 0.5] for both X and Y
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  isDiagonal?: boolean;
  diagonalType?: "TL_BR" | "TR_BL";
  isTopOrLeftTriangle?: boolean; // For diagonal halves
  color?: string;
  finish?: WallFinishType;
  children?: WallSegment[];
}

export interface WallSplitData {
  wallKey: string; // e.g. "wall_back"
  rootSegment: WallSegment;
  history: WallSegment[]; // History of rootSegment states for Undo
}

/**
 * Subdivides a target segment into child segments based on splitType.
 */
export function subdivideSegment(
  parentSegment: WallSegment,
  splitType: SplitType,
  defaultColor = "#C4B199",
  defaultFinish: WallFinishType = "EMULSION"
): WallSegment {
  const { id, parentWallKey, minX, maxX, minY, maxY } = parentSegment;
  const parentColor = parentSegment.color || defaultColor;
  const parentFinish = parentSegment.finish || defaultFinish;

  const child1Id = `${id}_1`;
  const child2Id = `${id}_2`;
  const timestamp = Date.now();

  let child1: WallSegment;
  let child2: WallSegment;

  if (splitType === "HORIZONTAL") {
    const midY = (minY + maxY) / 2;
    child1 = {
      id: `${id}_top_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Top)`,
      minX,
      maxX,
      minY: midY,
      maxY,
      color: parentColor,
      finish: parentFinish,
    };
    child2 = {
      id: `${id}_bot_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Bottom)`,
      minX,
      maxX,
      minY,
      maxY: midY,
      color: parentColor,
      finish: parentFinish,
    };
  } else if (splitType === "VERTICAL") {
    const midX = (minX + maxX) / 2;
    child1 = {
      id: `${id}_left_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Left)`,
      minX,
      maxX: midX,
      minY,
      maxY,
      color: parentColor,
      finish: parentFinish,
    };
    child2 = {
      id: `${id}_right_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Right)`,
      minX: midX,
      maxX,
      minY,
      maxY,
      color: parentColor,
      finish: parentFinish,
    };
  } else if (splitType === "DIAGONAL_TL_BR") {
    child1 = {
      id: `${id}_diag1_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Diag TL)`,
      minX,
      maxX,
      minY,
      maxY,
      isDiagonal: true,
      diagonalType: "TL_BR",
      isTopOrLeftTriangle: true,
      color: parentColor,
      finish: parentFinish,
    };
    child2 = {
      id: `${id}_diag2_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Diag BR)`,
      minX,
      maxX,
      minY,
      maxY,
      isDiagonal: true,
      diagonalType: "TL_BR",
      isTopOrLeftTriangle: false,
      color: parentColor,
      finish: parentFinish,
    };
  } else {
    // DIAGONAL_TR_BL
    child1 = {
      id: `${id}_diag1_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Diag TR)`,
      minX,
      maxX,
      minY,
      maxY,
      isDiagonal: true,
      diagonalType: "TR_BL",
      isTopOrLeftTriangle: true,
      color: parentColor,
      finish: parentFinish,
    };
    child2 = {
      id: `${id}_diag2_${timestamp}`,
      parentWallKey,
      label: `${parentSegment.label} (Diag BL)`,
      minX,
      maxX,
      minY,
      maxY,
      isDiagonal: true,
      diagonalType: "TR_BL",
      isTopOrLeftTriangle: false,
      color: parentColor,
      finish: parentFinish,
    };
  }

  return {
    ...parentSegment,
    splitType,
    children: [child1, child2],
  };
}

/**
 * Traverses a segment tree recursively and extracts all leaf (active paintable) segments.
 */
export function getLeafSegments(node: WallSegment): WallSegment[] {
  if (!node.children || node.children.length === 0) {
    return [node];
  }
  const leaves: WallSegment[] = [];
  for (const child of node.children) {
    leaves.push(...getLeafSegments(child));
  }
  return leaves;
}

/**
 * Finds a segment node by its ID in the segment tree.
 */
export function findSegmentById(node: WallSegment, targetId: string): WallSegment | null {
  if (node.id === targetId) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findSegmentById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Replaces a target segment node by ID within the segment tree.
 */
export function updateSegmentInTree(
  node: WallSegment,
  targetId: string,
  updater: (target: WallSegment) => WallSegment
): WallSegment {
  if (node.id === targetId) {
    return updater(node);
  }
  if (!node.children || node.children.length === 0) {
    return node;
  }
  return {
    ...node,
    children: node.children.map((child) => updateSegmentInTree(child, targetId, updater)),
  };
}
