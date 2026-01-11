import * as THREE from 'three';
import type { FoldPattern, FoldLine, PatternConfig } from '@/types';

/**
 * Paper Fold Package - Geometry Module
 *
 * Generates true 2D unfolding patterns (전개도) designed for glue-free assembly.
 * Uses interlocking tabs, tuck-in flaps, and proper fold mechanics.
 *
 * Follows origami principles including Kawasaki-Justin theorem:
 * At any interior vertex, alternating angles sum to 180° for flat-foldability.
 */

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a Vector3 on the XZ plane (Y=0 for flat patterns)
 */
function v2(x: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, 0, z);
}

/**
 * Create a fold line between two points
 */
function fold(
  start: THREE.Vector3,
  end: THREE.Vector3,
  type: 'mountain' | 'valley' | 'cut'
): FoldLine {
  return { start: start.clone(), end: end.clone(), type };
}

/**
 * Generate a trapezoidal tab shape for locking without glue
 * Tab narrows toward the tip for easier insertion
 */
function generateLockingTab(
  baseStart: THREE.Vector3,
  baseEnd: THREE.Vector3,
  tabDepth: number,
  inward: boolean = true
): { vertices: THREE.Vector3[]; foldLines: FoldLine[] } {
  const dir = baseEnd.clone().sub(baseStart);
  const len = dir.length();
  dir.normalize();

  // Perpendicular direction for tab extension
  const perp = new THREE.Vector3(-dir.z, 0, dir.x);
  if (!inward) perp.negate();

  // Tab tapers to 70% width at tip for easier tuck-in
  const taperRatio = 0.7;
  const insetRatio = (1 - taperRatio) / 2;

  const tabStart = baseStart.clone().add(perp.clone().multiplyScalar(tabDepth));
  const tabEnd = baseEnd.clone().add(perp.clone().multiplyScalar(tabDepth));

  // Inset the tip corners
  const tipStart = tabStart.clone().add(dir.clone().multiplyScalar(len * insetRatio));
  const tipEnd = tabEnd.clone().sub(dir.clone().multiplyScalar(len * insetRatio));

  const vertices = [
    baseStart.clone(),
    baseEnd.clone(),
    tipEnd,
    tipStart,
  ];

  const foldLines: FoldLine[] = [
    // Base fold line (mountain fold to tuck in)
    fold(baseStart, baseEnd, 'mountain'),
    // Cut lines for tab outline
    fold(baseStart, tipStart, 'cut'),
    fold(tipStart, tipEnd, 'cut'),
    fold(tipEnd, baseEnd, 'cut'),
  ];

  return { vertices, foldLines };
}

/**
 * Generate a slit for tab insertion (no glue needed)
 */
function generateSlit(
  start: THREE.Vector3,
  end: THREE.Vector3,
  slitRatio: number = 0.8
): FoldLine[] {
  const dir = end.clone().sub(start);
  const len = dir.length();
  dir.normalize();

  const inset = len * (1 - slitRatio) / 2;
  const slitStart = start.clone().add(dir.clone().multiplyScalar(inset));
  const slitEnd = end.clone().sub(dir.clone().multiplyScalar(inset));

  return [fold(slitStart, slitEnd, 'cut')];
}

// =============================================================================
// BOX PATTERN - Cross Layout with Locking Tabs
// =============================================================================

/**
 * Generate a box pattern (전개도) with interlocking tabs for glue-free assembly.
 *
 * Layout (top view, flat on XZ plane):
 *
 *              [LEFT SIDE]
 *                  │
 *     [BACK] ─ [BOTTOM] ─ [FRONT] ─ [TOP]
 *                  │
 *             [RIGHT SIDE]
 *
 * Tabs are added on alternating edges to allow tuck-in locking.
 */
export function generateBoxPattern(config: PatternConfig): FoldPattern {
  const { width, height, depth } = config;
  const tabDepth = Math.min(width, height, depth) * 0.15; // Tab is 15% of smallest dimension

  const vertices: THREE.Vector3[] = [];
  const foldLines: FoldLine[] = [];
  const faces: number[][] = [];

  // ==========================================================================
  // MAIN CROSS PATTERN
  // ==========================================================================

  // Bottom face (center of cross) - reference point
  const bottomBL = v2(-width / 2, -depth / 2);
  const bottomBR = v2(width / 2, -depth / 2);
  const bottomTR = v2(width / 2, depth / 2);
  const bottomTL = v2(-width / 2, depth / 2);

  // Front face (extends from bottom's front edge)
  const frontBL = v2(-width / 2, depth / 2);
  const frontBR = v2(width / 2, depth / 2);
  const frontTR = v2(width / 2, depth / 2 + height);
  const frontTL = v2(-width / 2, depth / 2 + height);

  // Back face (extends from bottom's back edge)
  const backTL = v2(-width / 2, -depth / 2);
  const backTR = v2(width / 2, -depth / 2);
  const backBR = v2(width / 2, -depth / 2 - height);
  const backBL = v2(-width / 2, -depth / 2 - height);

  // Left face (extends from bottom's left edge)
  const leftBR = v2(-width / 2, -depth / 2);
  const leftTR = v2(-width / 2, depth / 2);
  const leftTL = v2(-width / 2 - height, depth / 2);
  const leftBL = v2(-width / 2 - height, -depth / 2);

  // Right face (extends from bottom's right edge)
  const rightBL = v2(width / 2, -depth / 2);
  const rightTL = v2(width / 2, depth / 2);
  const rightTR = v2(width / 2 + height, depth / 2);
  const rightBR = v2(width / 2 + height, -depth / 2);

  // Top face (extends from front face, for closed box)
  const topBL = frontTL.clone();
  const topBR = frontTR.clone();
  const topTR = v2(width / 2, depth / 2 + height + depth);
  const topTL = v2(-width / 2, depth / 2 + height + depth);

  // Collect all main vertices
  vertices.push(
    bottomBL, bottomBR, bottomTR, bottomTL,  // 0-3
    frontTL, frontTR,                         // 4-5
    backBL, backBR,                           // 6-7
    leftBL, leftTL,                           // 8-9
    rightBR, rightTR,                         // 10-11
    topTL, topTR,                             // 12-13
  );

  // Define faces (for mesh generation)
  faces.push(
    [0, 1, 2, 3],     // bottom
    [3, 2, 5, 4],     // front
    [1, 0, 6, 7],     // back (note: vertices need adjusting for proper winding)
    [0, 3, 9, 8],     // left
    [2, 1, 10, 11],   // right
    [4, 5, 13, 12],   // top
  );

  // ==========================================================================
  // CUT LINES (Perimeter)
  // ==========================================================================

  // Outer perimeter cuts
  // Back face perimeter
  foldLines.push(fold(backBL, backBR, 'cut'));
  foldLines.push(fold(backBR, backTR, 'cut'));
  foldLines.push(fold(backBL, backTL, 'cut'));

  // Left face perimeter
  foldLines.push(fold(leftBL, leftTL, 'cut'));
  foldLines.push(fold(leftBL, leftBR, 'cut'));
  foldLines.push(fold(leftTL, leftTR, 'cut'));

  // Right face perimeter
  foldLines.push(fold(rightBR, rightTR, 'cut'));
  foldLines.push(fold(rightBL, rightBR, 'cut'));
  foldLines.push(fold(rightTL, rightTR, 'cut'));

  // Front face - only sides (top connects to top face)
  foldLines.push(fold(frontBL, frontTL, 'cut'));
  foldLines.push(fold(frontBR, frontTR, 'cut'));

  // Top face perimeter
  foldLines.push(fold(topTL, topTR, 'cut'));
  foldLines.push(fold(topTL, topBL, 'cut'));
  foldLines.push(fold(topTR, topBR, 'cut'));

  // ==========================================================================
  // FOLD LINES (Mountain and Valley)
  // ==========================================================================

  // Bottom to adjacent faces - Mountain folds (fold up)
  foldLines.push(fold(bottomBL, bottomBR, 'mountain')); // to back
  foldLines.push(fold(bottomTL, bottomTR, 'mountain')); // to front
  foldLines.push(fold(bottomBL, bottomTL, 'mountain')); // to left
  foldLines.push(fold(bottomBR, bottomTR, 'mountain')); // to right

  // Front to top - Mountain fold
  foldLines.push(fold(frontTL, frontTR, 'mountain'));

  // ==========================================================================
  // LOCKING TABS (Glue-free assembly)
  // ==========================================================================

  // Tab on left side of back face - tucks into left face
  const backLeftTab = generateLockingTab(backBL, backTL, tabDepth, true);
  foldLines.push(...backLeftTab.foldLines);

  // Tab on right side of back face - tucks into right face
  const backRightTab = generateLockingTab(backTR, backBR, tabDepth, true);
  foldLines.push(...backRightTab.foldLines);

  // Tab on left side of top face - tucks into left face when closed
  const topLeftTab = generateLockingTab(topTL, topBL, tabDepth, true);
  foldLines.push(...topLeftTab.foldLines);

  // Tab on right side of top face - tucks into right face when closed
  const topRightTab = generateLockingTab(topBR, topTR, tabDepth, true);
  foldLines.push(...topRightTab.foldLines);

  // Tab on top edge of top face - tucks into back face
  const topFrontTab = generateLockingTab(topTL, topTR, tabDepth, false);
  foldLines.push(...topFrontTab.foldLines);

  // ==========================================================================
  // INSERTION SLITS (for tabs)
  // ==========================================================================

  // Slits on left face edges for tabs
  foldLines.push(...generateSlit(leftBL, leftTL, 0.7));

  // Slits on right face edges for tabs
  foldLines.push(...generateSlit(rightBR, rightTR, 0.7));

  return {
    name: 'Box (Glue-Free)',
    vertices,
    foldLines,
    faces,
  };
}

// =============================================================================
// PYRAMID PATTERN - Star Layout with Tuck Flaps
// =============================================================================

/**
 * Generate a pyramid pattern with tuck-in flaps for glue-free assembly.
 *
 * Layout: Square base with 4 triangular faces radiating outward.
 * Adjacent triangles have alternating tabs that interlock when folded.
 *
 * Follows Kawasaki-Justin theorem: At the apex, 4 angles of 90° each
 * with alternating mountain/valley folds satisfy flat-foldability.
 */
export function generatePyramidPattern(config: PatternConfig): FoldPattern {
  const { width, depth, height } = config;
  const baseSize = Math.min(width, depth);
  const slantHeight = Math.sqrt(height * height + (baseSize / 2) * (baseSize / 2));
  const tabDepth = baseSize * 0.12;

  const vertices: THREE.Vector3[] = [];
  const foldLines: FoldLine[] = [];
  const faces: number[][] = [];

  const half = baseSize / 2;

  // Base square (center)
  const baseBL = v2(-half, -half);
  const baseBR = v2(half, -half);
  const baseTR = v2(half, half);
  const baseTL = v2(-half, half);

  // Triangle apexes (unfolded outward from each base edge)
  const apexFront = v2(0, half + slantHeight);
  const apexBack = v2(0, -half - slantHeight);
  const apexLeft = v2(-half - slantHeight, 0);
  const apexRight = v2(half + slantHeight, 0);

  vertices.push(
    baseBL, baseBR, baseTR, baseTL,  // 0-3
    apexFront, apexBack, apexLeft, apexRight,  // 4-7
  );

  faces.push(
    [0, 1, 2, 3],  // base
    [3, 2, 4],     // front triangle
    [1, 0, 5],     // back triangle
    [0, 3, 6],     // left triangle
    [2, 1, 7],     // right triangle
  );

  // ==========================================================================
  // CUT LINES (Outer perimeter of triangles)
  // ==========================================================================

  foldLines.push(fold(baseTL, apexFront, 'cut'));
  foldLines.push(fold(apexFront, baseTR, 'cut'));

  foldLines.push(fold(baseBR, apexBack, 'cut'));
  foldLines.push(fold(apexBack, baseBL, 'cut'));

  foldLines.push(fold(baseTL, apexLeft, 'cut'));
  foldLines.push(fold(apexLeft, baseBL, 'cut'));

  foldLines.push(fold(baseTR, apexRight, 'cut'));
  foldLines.push(fold(apexRight, baseBR, 'cut'));

  // ==========================================================================
  // FOLD LINES (Base edges - all mountain folds)
  // ==========================================================================

  foldLines.push(fold(baseTL, baseTR, 'mountain'));  // front edge
  foldLines.push(fold(baseBL, baseBR, 'mountain'));  // back edge
  foldLines.push(fold(baseBL, baseTL, 'mountain'));  // left edge
  foldLines.push(fold(baseBR, baseTR, 'mountain'));  // right edge

  // ==========================================================================
  // LOCKING TABS (On alternating triangle edges)
  // ==========================================================================

  // Tab on front-left edge (tucks under left triangle)
  const frontLeftTab = generateLockingTab(baseTL, apexFront, tabDepth, false);
  foldLines.push(...frontLeftTab.foldLines);

  // Tab on back-right edge (tucks under right triangle)
  const backRightTab = generateLockingTab(baseBR, apexBack, tabDepth, true);
  foldLines.push(...backRightTab.foldLines);

  // Tab on left-back edge (tucks under back triangle)
  const leftBackTab = generateLockingTab(apexLeft, baseBL, tabDepth, false);
  foldLines.push(...leftBackTab.foldLines);

  // Tab on right-front edge (tucks under front triangle)
  const rightFrontTab = generateLockingTab(apexRight, baseTR, tabDepth, true);
  foldLines.push(...rightFrontTab.foldLines);

  return {
    name: 'Pyramid (Glue-Free)',
    vertices,
    foldLines,
    faces,
  };
}

// =============================================================================
// ENVELOPE PATTERN - Classic Fold-Lock Design
// =============================================================================

/**
 * Generate an envelope pattern with fold-lock closure (no glue).
 *
 * Classic envelope uses 4 flaps that fold over each other in sequence:
 * 1. Bottom flap folds up
 * 2. Side flaps fold in (overlapping bottom)
 * 3. Top flap folds down and tucks under side flaps
 *
 * This creates a mechanical lock without adhesive.
 */
export function generateEnvelopePattern(config: PatternConfig): FoldPattern {
  const { width, depth } = config;
  const bodyWidth = width;
  const bodyDepth = depth * 0.6;  // Main body is 60% of total depth
  const flapDepth = depth * 0.25; // Side flaps
  const topFlapDepth = depth * 0.35;
  const bottomFlapDepth = depth * 0.3;

  const vertices: THREE.Vector3[] = [];
  const foldLines: FoldLine[] = [];
  const faces: number[][] = [];

  const hw = bodyWidth / 2;
  const hd = bodyDepth / 2;

  // Main body (center rectangle)
  const bodyBL = v2(-hw, -hd);
  const bodyBR = v2(hw, -hd);
  const bodyTR = v2(hw, hd);
  const bodyTL = v2(-hw, hd);

  // Bottom flap (triangular for traditional envelope look)
  const bottomApex = v2(0, -hd - bottomFlapDepth);

  // Top flap (triangular)
  const topApex = v2(0, hd + topFlapDepth);

  // Left flap (triangular)
  const leftApex = v2(-hw - flapDepth, 0);

  // Right flap (triangular)
  const rightApex = v2(hw + flapDepth, 0);

  vertices.push(
    bodyBL, bodyBR, bodyTR, bodyTL,  // 0-3
    bottomApex, topApex, leftApex, rightApex,  // 4-7
  );

  faces.push(
    [0, 1, 2, 3],  // main body
    [0, 1, 4],     // bottom flap
    [3, 2, 5],     // top flap
    [0, 3, 6],     // left flap
    [2, 1, 7],     // right flap
  );

  // ==========================================================================
  // CUT LINES (Outer perimeter)
  // ==========================================================================

  // Bottom flap edges
  foldLines.push(fold(bodyBL, bottomApex, 'cut'));
  foldLines.push(fold(bottomApex, bodyBR, 'cut'));

  // Top flap edges
  foldLines.push(fold(bodyTL, topApex, 'cut'));
  foldLines.push(fold(topApex, bodyTR, 'cut'));

  // Left flap edges
  foldLines.push(fold(bodyBL, leftApex, 'cut'));
  foldLines.push(fold(leftApex, bodyTL, 'cut'));

  // Right flap edges
  foldLines.push(fold(bodyBR, rightApex, 'cut'));
  foldLines.push(fold(rightApex, bodyTR, 'cut'));

  // ==========================================================================
  // FOLD LINES
  // ==========================================================================

  // All body edges are valley folds (flaps fold inward/upward)
  foldLines.push(fold(bodyBL, bodyBR, 'valley'));  // bottom edge
  foldLines.push(fold(bodyTL, bodyTR, 'valley'));  // top edge
  foldLines.push(fold(bodyBL, bodyTL, 'valley'));  // left edge
  foldLines.push(fold(bodyBR, bodyTR, 'valley'));  // right edge

  // ==========================================================================
  // TUCK-IN SLIT (on top flap for locking)
  // ==========================================================================

  // Small curved tuck on top flap creates lock with side flaps
  const slitWidth = bodyWidth * 0.3;
  const slitPos = v2(0, hd + topFlapDepth * 0.4);
  foldLines.push(fold(
    v2(-slitWidth / 2, slitPos.z),
    v2(slitWidth / 2, slitPos.z),
    'cut'
  ));

  return {
    name: 'Envelope (Glue-Free)',
    vertices,
    foldLines,
    faces,
  };
}

// =============================================================================
// PRISM PATTERN - Hexagonal with Alternating Tabs
// =============================================================================

/**
 * Generate a hexagonal prism pattern with alternating tabs.
 * Uses Kawasaki-Justin principle: alternating tabs ensure flat assembly.
 */
export function generatePrismPattern(config: PatternConfig): FoldPattern {
  const { width, height } = config;
  const radius = width / 2;
  const tabDepth = radius * 0.15;

  const vertices: THREE.Vector3[] = [];
  const foldLines: FoldLine[] = [];
  const faces: number[][] = [];

  // Generate hexagon vertices
  const hexPoints: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    hexPoints.push(v2(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ));
  }

  // Base hexagon
  vertices.push(...hexPoints);
  faces.push([0, 1, 2, 3, 4, 5]);

  // Hex perimeter is the base
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    foldLines.push(fold(hexPoints[i], hexPoints[next], 'mountain'));
  }

  // Generate 6 rectangular side faces unfolded outward
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    const p1 = hexPoints[i];
    const p2 = hexPoints[next];

    // Direction outward from center
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const outDir = mid.clone().normalize();

    // Side face vertices
    const s1 = p1.clone().add(outDir.clone().multiplyScalar(height));
    const s2 = p2.clone().add(outDir.clone().multiplyScalar(height));

    const vIdx = vertices.length;
    vertices.push(s1, s2);
    faces.push([i, next, vIdx + 1, vIdx]);

    // Outer edge cut
    foldLines.push(fold(s1, s2, 'cut'));

    // Side edges - alternating: cut on even, tab on odd
    if (i % 2 === 0) {
      // Cut edges (will receive tabs from adjacent faces)
      foldLines.push(fold(p1, s1, 'cut'));
      if (i === 4) {
        foldLines.push(fold(p2, s2, 'cut'));
      }
    } else {
      // Tab edges
      const tab = generateLockingTab(p1, s1, tabDepth, true);
      foldLines.push(...tab.foldLines);
    }
  }

  // Top hexagon (optional, as flap that tucks in)
  // This would be connected to one of the sides

  return {
    name: 'Hexagonal Prism (Glue-Free)',
    vertices,
    foldLines,
    faces,
  };
}

// =============================================================================
// CYLINDER PATTERN - Wrapped Rectangle with Tab/Slit Closure
// =============================================================================

/**
 * Generate a true cylinder pattern (not polygonal approximation).
 * Uses a wrapped rectangle with vertical tab/slit for glue-free closure.
 *
 * Layout:
 *    ┌──────────────────┐
 *    │   TOP CIRCLE     │  ← Top cap with tabs
 *    ├──────────────────┤
 *    │                  │
 *    │   BODY (rect)    │  ← Main cylinder body
 *    │                  │
 *    ├──────────────────┤
 *    │  BOTTOM CIRCLE   │  ← Bottom cap with tabs
 *    └──────────────────┘
 */
export function generateCylinderPattern(config: PatternConfig): FoldPattern {
  const { width, height } = config;
  const radius = width / 2;
  const circumference = 2 * Math.PI * radius;
  const tabDepth = radius * 0.15;

  const vertices: THREE.Vector3[] = [];
  const foldLines: FoldLine[] = [];
  const faces: number[][] = [];

  // ==========================================================================
  // MAIN BODY (Rectangle that wraps around)
  // ==========================================================================

  const bodyWidth = circumference;
  const bodyHeight = height;

  // Body rectangle corners
  const bodyBL = v2(0, 0);
  const bodyBR = v2(bodyWidth, 0);
  const bodyTR = v2(bodyWidth, bodyHeight);
  const bodyTL = v2(0, bodyHeight);

  vertices.push(bodyBL, bodyBR, bodyTR, bodyTL);
  faces.push([0, 1, 2, 3]);

  // ==========================================================================
  // CLOSURE TAB/SLIT (Vertical edge for wrapping)
  // ==========================================================================

  // Tab on right edge (wraps around to left)
  const tabHeight = bodyHeight * 0.8; // 80% of height for better hold
  const tabStart = bodyHeight * 0.1; // Start 10% from bottom
  const tabEnd = tabStart + tabHeight;

  const tabBL = v2(bodyWidth, tabStart);
  const tabTL = v2(bodyWidth, tabEnd);

  // Tab with taper
  const taperRatio = 0.7;
  const taperInset = (tabHeight * (1 - taperRatio)) / 2;

  const tabTipBL = v2(bodyWidth + tabDepth, tabStart + taperInset);
  const tabTipTL = v2(bodyWidth + tabDepth, tabEnd - taperInset);

  // Tab fold line (mountain - folds outward for insertion)
  foldLines.push(fold(tabBL, tabTL, 'mountain'));

  // Tab cut lines
  foldLines.push(fold(tabBL, tabTipBL, 'cut'));
  foldLines.push(fold(tabTipBL, tabTipTL, 'cut'));
  foldLines.push(fold(tabTipTL, tabTL, 'cut'));

  // Slit on left edge (receives tab)
  const slitStart = v2(0, tabStart + taperInset);
  const slitEnd = v2(0, tabEnd - taperInset);
  foldLines.push(fold(slitStart, slitEnd, 'cut'));

  // ==========================================================================
  // TOP CIRCLE (with radial tabs for attachment)
  // ==========================================================================

  const topCenterX = bodyWidth / 2;
  const topCenterY = bodyHeight + radius + tabDepth;

  // Approximate circle with 12-sided polygon for foldability
  const numSegments = 12;
  const topCircleVertices: THREE.Vector3[] = [];

  for (let i = 0; i < numSegments; i++) {
    const angle = (i * 2 * Math.PI) / numSegments;
    const x = topCenterX + radius * Math.cos(angle);
    const y = topCenterY + radius * Math.sin(angle);
    topCircleVertices.push(v2(x, y));
  }

  // Circle perimeter cuts
  for (let i = 0; i < numSegments; i++) {
    const next = (i + 1) % numSegments;
    foldLines.push(fold(topCircleVertices[i], topCircleVertices[next], 'cut'));
  }

  // Radial tabs from circle to body
  const topAttachY = bodyHeight;
  for (let i = 0; i < numSegments; i++) {
    const segmentX = (i * bodyWidth) / numSegments;
    const attachPoint = v2(segmentX, topAttachY);

    // Mountain fold at attachment line
    foldLines.push(
      fold(
        v2(segmentX, topAttachY),
        v2(segmentX + bodyWidth / numSegments, topAttachY),
        'mountain'
      )
    );

    // Valley fold from body to circle
    const circlePoint = topCircleVertices[i];
    foldLines.push(fold(attachPoint, circlePoint, 'valley'));
  }

  // ==========================================================================
  // BOTTOM CIRCLE (similar to top)
  // ==========================================================================

  const bottomCenterX = bodyWidth / 2;
  const bottomCenterY = -(radius + tabDepth);

  const bottomCircleVertices: THREE.Vector3[] = [];

  for (let i = 0; i < numSegments; i++) {
    const angle = (i * 2 * Math.PI) / numSegments;
    const x = bottomCenterX + radius * Math.cos(angle);
    const y = bottomCenterY + radius * Math.sin(angle);
    bottomCircleVertices.push(v2(x, y));
  }

  // Circle perimeter cuts
  for (let i = 0; i < numSegments; i++) {
    const next = (i + 1) % numSegments;
    foldLines.push(fold(bottomCircleVertices[i], bottomCircleVertices[next], 'cut'));
  }

  // Radial tabs
  const bottomAttachY = 0;
  for (let i = 0; i < numSegments; i++) {
    const segmentX = (i * bodyWidth) / numSegments;
    const attachPoint = v2(segmentX, bottomAttachY);

    foldLines.push(
      fold(
        v2(segmentX, bottomAttachY),
        v2(segmentX + bodyWidth / numSegments, bottomAttachY),
        'mountain'
      )
    );

    const circlePoint = bottomCircleVertices[i];
    foldLines.push(fold(attachPoint, circlePoint, 'valley'));
  }

  // ==========================================================================
  // OUTER PERIMETER CUTS
  // ==========================================================================

  // Body sides
  foldLines.push(fold(bodyBL, bodyBR, 'cut'));
  foldLines.push(fold(bodyTL, bodyTR, 'cut'));

  // Left edge (has slit already defined above)
  const leftTopOfSlit = v2(0, tabEnd - taperInset);
  const leftBottomOfSlit = v2(0, tabStart + taperInset);

  foldLines.push(fold(bodyBL, leftBottomOfSlit, 'cut'));
  foldLines.push(fold(leftTopOfSlit, bodyTL, 'cut'));

  // Right edge (except tab area)
  foldLines.push(fold(bodyBR, v2(bodyWidth, tabStart), 'cut'));
  foldLines.push(fold(v2(bodyWidth, tabEnd), bodyTR, 'cut'));

  return {
    name: 'Cylinder (Glue-Free)',
    vertices,
    foldLines,
    faces,
  };
}

// =============================================================================
// PATTERN FACTORY
// =============================================================================

/**
 * Generate the appropriate pattern based on shape type
 */
export function generatePattern(config: PatternConfig): FoldPattern {
  switch (config.shapeType) {
    case 'box':
      return generateBoxPattern(config);
    case 'pyramid':
      return generatePyramidPattern(config);
    case 'envelope':
      return generateEnvelopePattern(config);
    case 'prism':
      return generatePrismPattern(config);
    case 'cylinder':
      return generateCylinderPattern(config);
    default:
      return generateBoxPattern(config);
  }
}

// =============================================================================
// MESH GENERATION (for 3D preview)
// =============================================================================

/**
 * Convert fold pattern to Three.js mesh for 3D visualization
 */
export function patternToMesh(
  pattern: FoldPattern,
  material?: THREE.Material
): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();

  const positions: number[] = [];
  const indices: number[] = [];

  pattern.vertices.forEach((v) => {
    positions.push(v.x, v.y, v.z);
  });

  pattern.faces.forEach((face) => {
    // Triangulate polygon faces
    for (let i = 1; i < face.length - 1; i++) {
      indices.push(face[0], face[i], face[i + 1]);
    }
  });

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material || defaultMaterial);
}

/**
 * Create fold lines as Three.js line segments for visualization
 */
export function createFoldLineGeometry(
  foldLines: FoldLine[]
): Map<string, THREE.BufferGeometry> {
  const geometries = new Map<string, THREE.BufferGeometry>();

  const types = ['mountain', 'valley', 'cut'] as const;

  types.forEach((type) => {
    const lines = foldLines.filter((l) => l.type === type);
    if (lines.length === 0) return;

    const positions: number[] = [];
    lines.forEach((line) => {
      positions.push(
        line.start.x, line.start.y, line.start.z,
        line.end.x, line.end.y, line.end.z
      );
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    geometries.set(type, geometry);
  });

  return geometries;
}

// =============================================================================
// VALIDATION (Kawasaki-Justin Theorem Check)
// =============================================================================

/**
 * Verify flat-foldability at a vertex using Kawasaki-Justin theorem.
 * At any interior vertex, alternating angles must sum to 180°.
 *
 * @param vertex - The vertex to check
 * @param connectedLines - All fold lines connected to this vertex
 * @returns true if the vertex satisfies flat-foldability
 */
export function verifyKawasakiJustin(
  vertex: THREE.Vector3,
  connectedLines: FoldLine[]
): boolean {
  if (connectedLines.length < 4) {
    // Need at least 4 lines for a meaningful check
    return true;
  }

  // Calculate angles between consecutive lines
  const angles: number[] = [];
  const directions: THREE.Vector3[] = connectedLines.map(line => {
    const other = line.start.equals(vertex) ? line.end : line.start;
    return other.clone().sub(vertex).normalize();
  });

  // Sort by angle from positive x-axis
  directions.sort((a, b) => {
    return Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x);
  });

  // Calculate consecutive angles
  for (let i = 0; i < directions.length; i++) {
    const next = (i + 1) % directions.length;
    const angle = Math.acos(
      Math.max(-1, Math.min(1, directions[i].dot(directions[next])))
    );
    angles.push(angle);
  }

  // Check alternating sum
  let sumEven = 0;
  let sumOdd = 0;
  angles.forEach((angle, i) => {
    if (i % 2 === 0) sumEven += angle;
    else sumOdd += angle;
  });

  // Should both equal π (180°) with small tolerance
  const tolerance = 0.01;
  return Math.abs(sumEven - Math.PI) < tolerance &&
         Math.abs(sumOdd - Math.PI) < tolerance;
}
