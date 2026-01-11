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
  ASSEMBLY_MECHANICS,

  // Validation functions
  validatePattern,
  validateKawasakiJustin,
  validateTabDesign,
  validateThickness,
  validateTabSlitPairing,

  // Utilities
  formatValidationReport,
  extractVertices,
  findConnectedLines,
};
