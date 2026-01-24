/**
 * Theorem Validation System
 *
 * Parses theorem documentation and provides runtime validation for fold patterns.
 * Ensures generated patterns comply with both origami mathematics and assembly mechanics.
 */

import * as THREE from 'three';
import type { FoldPattern, FoldLine, PatternConfig } from '@/types';

// =============================================================================
// THEOREM DEFINITIONS (Machine-Readable)
// =============================================================================

/**
 * Kawasaki-Justin Theorem parameters
 * Reference: docs/theorems/kawasaki-justin.md
 */
export const KAWASAKI_JUSTIN = {
  id: 'kawasaki-justin',
  minFolds: 4,
  angleSumTotal: 2 * Math.PI,  // 360°
  alternatingSumEach: Math.PI,  // 180°
  tolerance: 0.01,  // ~0.57°
} as const;

/**
 * Maekawa's Theorem parameters
 * Reference: docs/theorems/maekawa.md
 */
export const MAEKAWA = {
  id: 'maekawa',
  differenceAbsolute: 2,  // |M - V| = 2
  minFolds: 4,            // Minimum folds for theorem to apply
  tolerance: 0.001,       // Vertex proximity tolerance
} as const;

// =============================================================================
// VERTEX TYPE DEFINITIONS
// =============================================================================

/**
 * Represents the M/V assignment type around a vertex.
 * The sequence is the circular order of fold types (sorted by angle from +X axis).
 */
export interface VertexTypeInfo {
  vertex: THREE.Vector3;
  degree: number;              // Number of folds meeting at vertex
  sequence: ('M' | 'V' | 'C')[];  // Circular M/V/C sequence (C=cut, excluded from counting)
  mountains: number;
  valleys: number;
  maekawaDifference: number;   // |M - V|
  maekawaSatisfied: boolean;
  isInterior: boolean;         // Interior vs perimeter vertex
  angles: number[];            // Consecutive angles between folds (radians)
}

/**
 * Result of vertex validity check (layer ordering via crimping)
 */
export interface VertexValidityResult {
  valid: boolean;
  vertexType: VertexTypeInfo;
  crimpSteps: CrimpStep[];
  failureReason?: string;
}

/**
 * A single step in the crimping reduction algorithm
 */
export interface CrimpStep {
  step: number;
  crimpedAngle: number;
  foldTypes: [string, string];  // The two fold types that were crimped
  remainingDegree: number;
}

/**
 * Assembly Mechanics parameters
 * Reference: docs/theorems/assembly-mechanics.md
 */
export const ASSEMBLY_MECHANICS = {
  id: 'assembly-mechanics',

  tab: {
    taperRatio: 0.7,            // Tip width = 70% of base
    taperRatioRange: [0.65, 0.75] as const,
    depthCoefficient: {
      box: 0.15,
      pyramid: 0.12,
      prism: 0.15,
      cylinder: 0.15,
      envelope: 0.10,
    },
    depthRange: [0.08, 0.2] as const,  // Fraction of min dimension
  },

  slit: {
    lengthRatio: 0.8,           // 80% of edge length
    lengthRatioRange: [0.7, 0.85] as const,
    centerOffset: 0.5,          // Centered on edge
  },

  interferenceFit: {
    coefficient: 0.05,          // 5% of material thickness
    range: [0.05, 0.1] as const,
  },

  minFeatureSizeMultiplier: 5,  // Features must be >= 5× thickness
} as const;

// =============================================================================
// VALIDATION RESULTS
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  theoremId: string;
  errors: string[];
  warnings: string[];
  details?: Record<string, unknown>;
}

export interface PatternValidation {
  overall: boolean;
  theorems: ValidationResult[];
  timestamp: number;
}

// =============================================================================
// KAWASAKI-JUSTIN VALIDATION
// =============================================================================

/**
 * Find all fold lines connected to a vertex
 */
function findConnectedLines(
  vertex: THREE.Vector3,
  allLines: FoldLine[],
  tolerance: number = 0.001
): FoldLine[] {
  return allLines.filter(line =>
    line.start.distanceTo(vertex) < tolerance ||
    line.end.distanceTo(vertex) < tolerance
  );
}

/**
 * Extract unique vertices from fold lines
 */
function extractVertices(foldLines: FoldLine[]): THREE.Vector3[] {
  const vertices: THREE.Vector3[] = [];
  const tolerance = 0.001;

  foldLines.forEach(line => {
    [line.start, line.end].forEach(point => {
      const exists = vertices.some(v => v.distanceTo(point) < tolerance);
      if (!exists) {
        vertices.push(point.clone());
      }
    });
  });

  return vertices;
}

/**
 * Verify Kawasaki-Justin theorem at a single vertex
 * Implementation from geometry.ts but with detailed error reporting
 */
export function verifyKawasakiJustinAtVertex(
  vertex: THREE.Vector3,
  connectedLines: FoldLine[]
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: KAWASAKI_JUSTIN.id,
    errors: [],
    warnings: [],
    details: {},
  };

  // Check minimum folds
  if (connectedLines.length < KAWASAKI_JUSTIN.minFolds) {
    // Perimeter vertices are exempt
    result.warnings.push(
      `Vertex at (${vertex.x.toFixed(2)}, ${vertex.z.toFixed(2)}) has only ${connectedLines.length} folds (exempt from theorem)`
    );
    result.details = { vertexType: 'perimeter', foldCount: connectedLines.length };
    return result;
  }

  // Calculate direction vectors from vertex to endpoints
  const directions: THREE.Vector3[] = connectedLines.map(line => {
    const other = line.start.equals(vertex) ? line.end : line.start;
    return other.clone().sub(vertex).normalize();
  });

  // Sort by angle from positive X-axis (in XZ plane)
  directions.sort((a, b) => {
    return Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x);
  });

  // Calculate consecutive angles
  const angles: number[] = [];
  for (let i = 0; i < directions.length; i++) {
    const next = (i + 1) % directions.length;
    const dotProduct = directions[i].dot(directions[next]);
    const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
    angles.push(angle);
  }

  // Calculate alternating sums
  let sumEven = 0;
  let sumOdd = 0;
  angles.forEach((angle, i) => {
    if (i % 2 === 0) sumEven += angle;
    else sumOdd += angle;
  });

  const totalSum = sumEven + sumOdd;

  // Validate total sum = 2π
  if (Math.abs(totalSum - KAWASAKI_JUSTIN.angleSumTotal) > KAWASAKI_JUSTIN.tolerance) {
    result.valid = false;
    result.errors.push(
      `Total angle sum ${totalSum.toFixed(4)} ≠ 2π (${KAWASAKI_JUSTIN.angleSumTotal.toFixed(4)})`
    );
  }

  // Validate each alternating sum = π
  const errorEven = Math.abs(sumEven - KAWASAKI_JUSTIN.alternatingSumEach);
  const errorOdd = Math.abs(sumOdd - KAWASAKI_JUSTIN.alternatingSumEach);

  if (errorEven > KAWASAKI_JUSTIN.tolerance) {
    result.valid = false;
    result.errors.push(
      `Even angle sum ${sumEven.toFixed(4)} ≠ π (error: ${errorEven.toFixed(4)})`
    );
  }

  if (errorOdd > KAWASAKI_JUSTIN.tolerance) {
    result.valid = false;
    result.errors.push(
      `Odd angle sum ${sumOdd.toFixed(4)} ≠ π (error: ${errorOdd.toFixed(4)})`
    );
  }

  result.details = {
    vertexType: 'interior',
    foldCount: connectedLines.length,
    angles: angles.map(a => a.toFixed(4)),
    sumEven: sumEven.toFixed(4),
    sumOdd: sumOdd.toFixed(4),
    sumTotal: totalSum.toFixed(4),
  };

  return result;
}

/**
 * Validate entire pattern against Kawasaki-Justin theorem
 */
export function validateKawasakiJustin(pattern: FoldPattern): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: KAWASAKI_JUSTIN.id,
    errors: [],
    warnings: [],
    details: { vertices: [] },
  };

  const vertices = extractVertices(pattern.foldLines);
  const vertexResults: ValidationResult[] = [];

  vertices.forEach(vertex => {
    const connected = findConnectedLines(vertex, pattern.foldLines);
    const vertexResult = verifyKawasakiJustinAtVertex(vertex, connected);

    vertexResults.push(vertexResult);

    if (!vertexResult.valid) {
      result.valid = false;
      result.errors.push(...vertexResult.errors);
    }

    result.warnings.push(...vertexResult.warnings);
  });

  result.details = {
    totalVertices: vertices.length,
    validVertices: vertexResults.filter(v => v.valid).length,
    vertexResults,
  };

  return result;
}

// =============================================================================
// VERTEX TYPE AND VALIDITY
// =============================================================================

/**
 * Compute the vertex type (M/V sequence) at a single vertex.
 * Folds are sorted by angle from +X axis in the XZ plane.
 */
export function getVertexType(
  vertex: THREE.Vector3,
  connectedLines: FoldLine[]
): VertexTypeInfo {
  // Compute direction vectors and pair with fold types
  const foldData = connectedLines.map(line => {
    const other = line.start.distanceTo(vertex) < 0.001 ? line.end : line.start;
    const dir = other.clone().sub(vertex).normalize();
    const angle = Math.atan2(dir.z, dir.x);
    return { angle, type: line.type };
  });

  // Sort by angle (counter-clockwise from +X)
  foldData.sort((a, b) => a.angle - b.angle);

  // Build M/V/C sequence
  const sequence: ('M' | 'V' | 'C')[] = foldData.map(f => {
    if (f.type === 'mountain') return 'M';
    if (f.type === 'valley') return 'V';
    return 'C';
  });

  // Calculate consecutive angles between sorted folds
  const angles: number[] = [];
  for (let i = 0; i < foldData.length; i++) {
    const next = (i + 1) % foldData.length;
    let diff = foldData[next].angle - foldData[i].angle;
    if (diff <= 0) diff += 2 * Math.PI;
    angles.push(diff);
  }

  // Count M and V (excluding cuts)
  const mountains = sequence.filter(s => s === 'M').length;
  const valleys = sequence.filter(s => s === 'V').length;
  const maekawaDifference = Math.abs(mountains - valleys);

  // A vertex is interior if it has >= 4 folds (excluding cuts)
  const mvCount = mountains + valleys;
  const isInterior = mvCount >= MAEKAWA.minFolds;

  return {
    vertex: vertex.clone(),
    degree: connectedLines.length,
    sequence,
    mountains,
    valleys,
    maekawaDifference,
    maekawaSatisfied: !isInterior || maekawaDifference === MAEKAWA.differenceAbsolute,
    isInterior,
    angles,
  };
}

/**
 * Validate Maekawa's theorem across an entire pattern.
 * Checks |M - V| = 2 at every interior vertex.
 */
export function validateMaekawa(pattern: FoldPattern): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: MAEKAWA.id,
    errors: [],
    warnings: [],
    details: {},
  };

  const vertices = extractVertices(pattern.foldLines);
  const vertexTypes: VertexTypeInfo[] = [];

  vertices.forEach(vertex => {
    const connected = findConnectedLines(vertex, pattern.foldLines);
    const vertexType = getVertexType(vertex, connected);
    vertexTypes.push(vertexType);

    if (!vertexType.isInterior) {
      result.warnings.push(
        `Vertex (${vertex.x.toFixed(2)}, ${vertex.z.toFixed(2)}): perimeter vertex (${vertexType.degree} folds, exempt)`
      );
      return;
    }

    if (!vertexType.maekawaSatisfied) {
      result.valid = false;
      result.errors.push(
        `Vertex (${vertex.x.toFixed(2)}, ${vertex.z.toFixed(2)}) violates Maekawa: ` +
        `M=${vertexType.mountains}, V=${vertexType.valleys}, ` +
        `|M-V|=${vertexType.maekawaDifference} (must be 2). ` +
        `Type: [${vertexType.sequence.join('')}]`
      );
    }
  });

  result.details = {
    totalVertices: vertices.length,
    interiorVertices: vertexTypes.filter(v => v.isInterior).length,
    validVertices: vertexTypes.filter(v => v.maekawaSatisfied).length,
    vertexTypes: vertexTypes.map(v => ({
      position: `(${v.vertex.x.toFixed(2)}, ${v.vertex.z.toFixed(2)})`,
      sequence: v.sequence.join(''),
      M: v.mountains,
      V: v.valleys,
      satisfied: v.maekawaSatisfied,
      interior: v.isInterior,
    })),
  };

  return result;
}

/**
 * Check vertex validity using the crimping algorithm.
 *
 * The crimping algorithm tests whether an M/V assignment can fold flat
 * without layer self-intersection:
 * 1. Find the smallest angle sector between consecutive folds
 * 2. If bounding folds are opposite types (M and V), "crimp" them
 *    (remove both folds and merge the adjacent angle sectors)
 * 3. Repeat until only 2 folds remain (valid) or smallest sector
 *    is bounded by same-type folds (invalid)
 *
 * This implements a necessary condition from Justin's theorem for layer ordering.
 */
export function checkVertexValidity(vertexType: VertexTypeInfo): VertexValidityResult {
  const crimpSteps: CrimpStep[] = [];

  // Only check interior vertices with M/V folds
  const mvSequence = vertexType.sequence.filter(s => s !== 'C');
  const mvAngles = [...vertexType.angles];

  if (mvSequence.length < 4) {
    return {
      valid: true,
      vertexType,
      crimpSteps,
      failureReason: undefined,
    };
  }

  // First check Maekawa as a prerequisite
  if (!vertexType.maekawaSatisfied) {
    return {
      valid: false,
      vertexType,
      crimpSteps,
      failureReason: `Maekawa violated: |M-V|=${vertexType.maekawaDifference} (must be 2)`,
    };
  }

  // Working copies for the crimping reduction
  const types = [...mvSequence];
  const angles = [...mvAngles];
  let step = 0;

  while (types.length > 2) {
    // Find the smallest angle
    let minIdx = 0;
    let minAngle = angles[0];
    for (let i = 1; i < angles.length; i++) {
      if (angles[i] < minAngle) {
        minAngle = angles[i];
        minIdx = i;
      }
    }

    // The smallest angle is between folds[minIdx] and folds[(minIdx+1) % n]
    const leftIdx = minIdx;
    const rightIdx = (minIdx + 1) % types.length;
    const leftType = types[leftIdx];
    const rightType = types[rightIdx];

    // Check if the bounding folds are opposite types
    if (leftType === rightType) {
      // Same type bounds the smallest angle — cannot crimp, invalid
      return {
        valid: false,
        vertexType,
        crimpSteps,
        failureReason:
          `Cannot crimp: smallest angle (${(minAngle * 180 / Math.PI).toFixed(1)}°) ` +
          `bounded by same fold types (${leftType}, ${rightType}) at step ${step + 1}. ` +
          `Remaining sequence: [${types.join('')}]`,
      };
    }

    // Crimp: remove both folds, merge angle sectors
    step++;
    crimpSteps.push({
      step,
      crimpedAngle: minAngle,
      foldTypes: [leftType, rightType],
      remainingDegree: types.length - 2,
    });

    // Merge: the crimped sector gets absorbed into the adjacent sector
    // Remove the two folds and combine angles:
    // angle[left-1] + angle[right] - angle[minIdx] becomes the new sector
    const prevIdx = (leftIdx - 1 + angles.length) % angles.length;
    const nextAngleIdx = rightIdx < angles.length ? rightIdx : 0;

    if (types.length === 3) {
      // Special case: 3 folds -> 1 fold (shouldn't happen if Maekawa holds)
      types.splice(0, types.length);
      angles.splice(0, angles.length);
      break;
    }

    // Calculate new merged angle
    const newAngle = angles[prevIdx] + angles[nextAngleIdx] - minAngle;

    // Remove the two folds and their shared angle
    // We need to be careful with circular indexing
    if (rightIdx > leftIdx) {
      types.splice(rightIdx, 1);
      types.splice(leftIdx, 1);
      angles.splice(rightIdx, 1);
      angles[leftIdx > 0 ? leftIdx - 1 : angles.length - 1] = newAngle;
      angles.splice(leftIdx, 1);
    } else {
      // rightIdx wrapped around (rightIdx === 0, leftIdx === types.length - 1)
      types.splice(leftIdx, 1);
      types.splice(0, 1);
      angles.splice(leftIdx, 1);
      if (angles.length > 0) {
        angles[angles.length - 1] = newAngle;
        angles.splice(0, 1);
      }
    }
  }

  return {
    valid: true,
    vertexType,
    crimpSteps,
  };
}

/**
 * Validate vertex types and layer ordering for an entire pattern.
 * Combines Maekawa check with crimping-based validity.
 */
export function validateVertexValidity(pattern: FoldPattern): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'vertex-validity',
    errors: [],
    warnings: [],
    details: {},
  };

  const vertices = extractVertices(pattern.foldLines);
  const validityResults: VertexValidityResult[] = [];

  vertices.forEach(vertex => {
    const connected = findConnectedLines(vertex, pattern.foldLines);
    const vertexType = getVertexType(vertex, connected);

    if (!vertexType.isInterior) {
      return; // Skip perimeter vertices
    }

    const validity = checkVertexValidity(vertexType);
    validityResults.push(validity);

    if (!validity.valid) {
      result.valid = false;
      result.errors.push(
        `Vertex (${vertex.x.toFixed(2)}, ${vertex.z.toFixed(2)}) ` +
        `type [${vertexType.sequence.join('')}] is invalid: ${validity.failureReason}`
      );
    } else if (validity.crimpSteps.length > 0) {
      result.warnings.push(
        `Vertex (${vertex.x.toFixed(2)}, ${vertex.z.toFixed(2)}) ` +
        `type [${vertexType.sequence.join('')}] valid after ${validity.crimpSteps.length} crimp(s)`
      );
    }
  });

  result.details = {
    interiorVertices: validityResults.length,
    validVertices: validityResults.filter(v => v.valid).length,
    invalidVertices: validityResults.filter(v => !v.valid).length,
    results: validityResults.map(v => ({
      position: `(${v.vertexType.vertex.x.toFixed(2)}, ${v.vertexType.vertex.z.toFixed(2)})`,
      type: v.vertexType.sequence.join(''),
      valid: v.valid,
      crimpSteps: v.crimpSteps.length,
      failureReason: v.failureReason,
    })),
  };

  return result;
}

// =============================================================================
// ASSEMBLY MECHANICS VALIDATION
// =============================================================================

/**
 * Validate tab design parameters
 */
export function validateTabDesign(config: PatternConfig): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'assembly-mechanics-tabs',
    errors: [],
    warnings: [],
    details: {},
  };

  const minDim = Math.min(config.width, config.height, config.depth);
  const expectedCoeff = ASSEMBLY_MECHANICS.tab.depthCoefficient[config.shapeType] || 0.15;
  const expectedTabDepth = minDim * expectedCoeff;

  // Note: Current implementation calculates tab depth inline, not from config
  // This is a limitation we should document

  result.warnings.push(
    `Tab depth should be ~${expectedTabDepth.toFixed(2)}cm (${(expectedCoeff * 100).toFixed(0)}% of ${minDim.toFixed(2)}cm)`
  );

  // Check thickness constraints
  const minFeatureSize = config.thickness * ASSEMBLY_MECHANICS.minFeatureSizeMultiplier;
  const actualTabDepth = minDim * expectedCoeff;

  if (actualTabDepth < minFeatureSize) {
    result.valid = false;
    result.errors.push(
      `Tab depth ${actualTabDepth.toFixed(2)}cm < minimum feature size ${minFeatureSize.toFixed(2)}cm (5× thickness)`
    );
  }

  result.details = {
    minDimension: minDim.toFixed(2),
    depthCoefficient: expectedCoeff,
    expectedTabDepth: expectedTabDepth.toFixed(2),
    minFeatureSize: minFeatureSize.toFixed(2),
    thickness: config.thickness,
  };

  return result;
}

/**
 * Validate material thickness constraints
 */
export function validateThickness(config: PatternConfig): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'assembly-mechanics-thickness',
    errors: [],
    warnings: [],
    details: {},
  };

  const minDim = Math.min(config.width, config.height, config.depth);
  const minFeatureSize = config.thickness * ASSEMBLY_MECHANICS.minFeatureSizeMultiplier;

  // Check if features can be manufactured at this thickness
  if (config.thickness > minDim * 0.1) {
    result.warnings.push(
      `Thickness ${config.thickness}mm is > 10% of smallest dimension (${minDim}cm). May be difficult to fold.`
    );
  }

  // Check fold radius feasibility
  const minFoldRadius = config.thickness / 2;
  result.details = {
    thickness: config.thickness,
    minFoldRadius: minFoldRadius.toFixed(2),
    minFeatureSize: minFeatureSize.toFixed(2),
  };

  return result;
}

/**
 * Validate tab-slit pairing pattern
 */
export function validateTabSlitPairing(pattern: FoldPattern): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'assembly-mechanics-pairing',
    errors: [],
    warnings: [],
    details: {},
  };

  // Count tabs vs slits
  const foldLinesWithTabs = new Set<string>();
  const cutLinesSlits = new Set<string>();

  pattern.foldLines.forEach(line => {
    const key = `${line.start.x},${line.start.z}-${line.end.x},${line.end.z}`;

    if (line.type === 'mountain') {
      // Mountain folds often indicate tab bases
      foldLinesWithTabs.add(key);
    } else if (line.type === 'cut') {
      // Some cuts are slits (would need more context to distinguish)
      cutLinesSlits.add(key);
    }
  });

  result.details = {
    mountainFolds: foldLinesWithTabs.size,
    cutLines: cutLinesSlits.size,
    note: 'Tab-slit pairing requires geometric analysis beyond line type',
  };

  result.warnings.push(
    'Tab-slit pairing validation requires geometric context (not yet implemented)'
  );

  return result;
}

// =============================================================================
// FULL PATTERN VALIDATION
// =============================================================================

/**
 * Validate a complete fold pattern against all theorems
 */
export function validatePattern(
  pattern: FoldPattern,
  config: PatternConfig
): PatternValidation {
  const theoremResults: ValidationResult[] = [
    validateKawasakiJustin(pattern),
    validateMaekawa(pattern),
    validateVertexValidity(pattern),
    validateTabDesign(config),
    validateThickness(config),
    validateTabSlitPairing(pattern),
  ];

  const overall = theoremResults.every(r => r.valid);

  return {
    overall,
    theorems: theoremResults,
    timestamp: Date.now(),
  };
}

/**
 * Format validation results as human-readable text
 */
export function formatValidationReport(validation: PatternValidation): string {
  const lines: string[] = [
    '=== Pattern Validation Report ===',
    `Timestamp: ${new Date(validation.timestamp).toISOString()}`,
    `Overall: ${validation.overall ? '✓ VALID' : '✗ INVALID'}`,
    '',
  ];

  validation.theorems.forEach(theorem => {
    lines.push(`--- ${theorem.theoremId} ---`);
    lines.push(`Status: ${theorem.valid ? '✓ Valid' : '✗ Invalid'}`);

    if (theorem.errors.length > 0) {
      lines.push('Errors:');
      theorem.errors.forEach(err => lines.push(`  - ${err}`));
    }

    if (theorem.warnings.length > 0) {
      lines.push('Warnings:');
      theorem.warnings.forEach(warn => lines.push(`  - ${warn}`));
    }

    if (theorem.details && Object.keys(theorem.details).length > 0) {
      lines.push('Details:');
      lines.push(`  ${JSON.stringify(theorem.details, null, 2).split('\n').join('\n  ')}`);
    }

    lines.push('');
  });

  return lines.join('\n');
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Constants
  KAWASAKI_JUSTIN,
  MAEKAWA,
  ASSEMBLY_MECHANICS,

  // Validation functions
  validatePattern,
  validateKawasakiJustin,
  validateMaekawa,
  validateVertexValidity,
  validateTabDesign,
  validateThickness,
  validateTabSlitPairing,

  // Vertex type utilities
  getVertexType,
  checkVertexValidity,

  // Utilities
  formatValidationReport,
  extractVertices,
  findConnectedLines,
};
