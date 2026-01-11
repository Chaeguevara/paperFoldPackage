/**
 * Parameter Behavior Validator
 *
 * Validates that UI parameters actually affect the generated patterns.
 * Detects when sliders are shown but have no effect on output.
 */

import type { PatternConfig, FoldPattern, ShapeType } from '@/types';
import { generatePattern } from './geometry';

// =============================================================================
// PARAMETER USAGE DEFINITIONS
// =============================================================================

/**
 * Define which parameters each shape actually uses
 * Reference: docs/PARAMETER_BEHAVIOR.md
 */
export const PARAMETER_USAGE: Record<ShapeType, {
  width: boolean;
  height: boolean;
  depth: boolean;
  thickness: boolean;
  notes?: string;
}> = {
  box: {
    width: true,
    height: true,
    depth: true,
    thickness: false,  // Used in validation only, not pattern generation
    notes: 'All dimensions used correctly',
  },
  pyramid: {
    width: true,
    height: true,
    depth: true,
    thickness: false,
    notes: 'Uses min(width, depth) for square base - confusing when width ≠ depth',
  },
  prism: {
    width: true,
    height: true,
    depth: false,  // Depth is ignored!
    thickness: false,
    notes: 'Hexagonal prism defined by width (diameter) and height only',
  },
  cylinder: {
    width: true,
    height: true,
    depth: false,  // Cylinders only need diameter + height
    thickness: false,
    notes: 'True cylinder with wrapped body - only uses width (diameter) and height',
  },
  envelope: {
    width: true,
    height: false,  // Height is ignored!
    depth: true,
    thickness: false,
    notes: 'Envelopes are 2D: width × depth, height ignored',
  },
};

// =============================================================================
// VALIDATION RESULTS
// =============================================================================

export interface ParameterTestResult {
  parameter: keyof PatternConfig;
  used: boolean;
  actuallyAffectsPattern: boolean;
  shouldBeShown: boolean;
  issue?: string;
}

export interface BehaviorValidation {
  shapeType: ShapeType;
  tests: ParameterTestResult[];
  warnings: string[];
  recommendations: string[];
}

// =============================================================================
// PATTERN COMPARISON
// =============================================================================

/**
 * Check if two patterns are functionally identical
 * (vertices and fold lines in same positions)
 */
function patternsAreEqual(p1: FoldPattern, p2: FoldPattern): boolean {
  // Quick check: different vertex/line counts = different patterns
  if (p1.vertices.length !== p2.vertices.length) return false;
  if (p1.foldLines.length !== p2.foldLines.length) return false;

  // Check vertices (tolerance for floating point)
  const tolerance = 0.0001;
  for (let i = 0; i < p1.vertices.length; i++) {
    const v1 = p1.vertices[i];
    const v2 = p2.vertices[i];
    if (v1.distanceTo(v2) > tolerance) {
      return false;
    }
  }

  // Check fold lines
  for (let i = 0; i < p1.foldLines.length; i++) {
    const l1 = p1.foldLines[i];
    const l2 = p2.foldLines[i];

    if (l1.type !== l2.type) return false;
    if (l1.start.distanceTo(l2.start) > tolerance) return false;
    if (l1.end.distanceTo(l2.end) > tolerance) return false;
  }

  return true;
}

// =============================================================================
// PARAMETER TESTING
// =============================================================================

/**
 * Test if changing a parameter actually affects the pattern
 */
function testParameter(
  config: PatternConfig,
  parameter: keyof PatternConfig,
  testValue: number | string
): boolean {
  // Generate baseline pattern
  const baseline = generatePattern(config);

  // Generate pattern with changed parameter
  const modified = generatePattern({
    ...config,
    [parameter]: testValue,
  });

  // If patterns are different, parameter is being used
  return !patternsAreEqual(baseline, modified);
}

/**
 * Validate parameter behavior for a given configuration
 */
export function validateParameterBehavior(config: PatternConfig): BehaviorValidation {
  const usage = PARAMETER_USAGE[config.shapeType];
  const tests: ParameterTestResult[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Test width
  const widthTest: ParameterTestResult = {
    parameter: 'width',
    used: usage.width,
    actuallyAffectsPattern: testParameter(config, 'width', config.width * 2),
    shouldBeShown: true,  // Width always makes sense to show
  };

  if (widthTest.used && !widthTest.actuallyAffectsPattern) {
    widthTest.issue = 'Parameter marked as used but changing it has no effect';
    warnings.push(`Width parameter has no effect (likely due to min() constraint)`);
  }
  tests.push(widthTest);

  // Test height
  const heightTest: ParameterTestResult = {
    parameter: 'height',
    used: usage.height,
    actuallyAffectsPattern: testParameter(config, 'height', config.height * 2),
    shouldBeShown: usage.height,
  };

  if (!heightTest.used && heightTest.actuallyAffectsPattern) {
    heightTest.issue = 'Parameter marked as unused but actually affects pattern';
    warnings.push(`Height affects pattern but is marked as unused`);
  } else if (!heightTest.used) {
    recommendations.push(`Hide height slider for ${config.shapeType} (not used)`);
  }
  tests.push(heightTest);

  // Test depth
  const depthTest: ParameterTestResult = {
    parameter: 'depth',
    used: usage.depth,
    actuallyAffectsPattern: testParameter(config, 'depth', config.depth * 2),
    shouldBeShown: usage.depth,
  };

  if (!depthTest.used && depthTest.actuallyAffectsPattern) {
    depthTest.issue = 'Parameter marked as unused but actually affects pattern';
    warnings.push(`Depth affects pattern but is marked as unused`);
  } else if (!depthTest.used) {
    recommendations.push(`Hide depth slider for ${config.shapeType} (not used)`);
  }
  tests.push(depthTest);

  // Test thickness
  const thicknessTest: ParameterTestResult = {
    parameter: 'thickness',
    used: usage.thickness,
    actuallyAffectsPattern: testParameter(config, 'thickness', config.thickness * 2),
    shouldBeShown: true,  // Always show thickness for validation purposes
  };

  if (!thicknessTest.used && !thicknessTest.actuallyAffectsPattern) {
    recommendations.push(`Thickness only used in validation, not pattern generation`);
  }
  tests.push(thicknessTest);

  // Shape-specific warnings
  if (config.shapeType === 'pyramid') {
    if (config.width !== config.depth) {
      const baseSize = Math.min(config.width, config.depth);
      const unused = config.width > config.depth ? 'width' : 'depth';
      warnings.push(
        `Pyramid uses min(width=${config.width}, depth=${config.depth}) = ${baseSize}cm. ` +
        `Changing ${unused} has no effect unless it becomes smaller.`
      );
      recommendations.push(
        `Set width = depth for predictable behavior, or fix pyramid to use separate dimensions`
      );
    }
  }

  return {
    shapeType: config.shapeType,
    tests,
    warnings,
    recommendations,
  };
}

/**
 * Validate all standard shapes with default configs
 */
export function validateAllShapes(): Record<ShapeType, BehaviorValidation> {
  const shapes: ShapeType[] = ['box', 'pyramid', 'prism', 'cylinder', 'envelope'];

  const results: Record<string, BehaviorValidation> = {};

  shapes.forEach(shapeType => {
    const config: PatternConfig = {
      shapeType,
      width: 5,
      height: 3,
      depth: 5,
      thickness: 0.5,
    };

    results[shapeType] = validateParameterBehavior(config);
  });

  return results as Record<ShapeType, BehaviorValidation>;
}

/**
 * Format validation results as human-readable report
 */
export function formatBehaviorReport(validation: BehaviorValidation): string {
  const lines: string[] = [
    `=== Parameter Behavior: ${validation.shapeType} ===`,
    '',
    'Parameter Tests:',
  ];

  validation.tests.forEach(test => {
    const status = test.actuallyAffectsPattern ? '✓ Affects pattern' : '✗ No effect';
    const shouldShow = test.shouldBeShown ? 'Show in UI' : 'Hide from UI';

    lines.push(`  ${test.parameter}:`);
    lines.push(`    - ${status}`);
    lines.push(`    - ${shouldShow}`);
    if (test.issue) {
      lines.push(`    - ⚠️  ${test.issue}`);
    }
  });

  if (validation.warnings.length > 0) {
    lines.push('', 'Warnings:');
    validation.warnings.forEach(warn => {
      lines.push(`  - ${warn}`);
    });
  }

  if (validation.recommendations.length > 0) {
    lines.push('', 'Recommendations:');
    validation.recommendations.forEach(rec => {
      lines.push(`  - ${rec}`);
    });
  }

  return lines.join('\n');
}

/**
 * Format validation for all shapes
 */
export function formatAllShapesReport(): string {
  const validations = validateAllShapes();
  const lines: string[] = ['=== Parameter Behavior Validation: All Shapes ===', ''];

  Object.values(validations).forEach(validation => {
    lines.push(formatBehaviorReport(validation));
    lines.push('');
  });

  return lines.join('\n');
}

// =============================================================================
// EDGE CASE DETECTION
// =============================================================================

/**
 * Detect pyramid edge case where width/depth affects behavior differently
 */
export function detectPyramidEdgeCase(config: PatternConfig): {
  isEdgeCase: boolean;
  baseSize: number;
  limitingDimension: 'width' | 'depth' | 'both';
  message?: string;
} {
  if (config.shapeType !== 'pyramid') {
    return { isEdgeCase: false, baseSize: 0, limitingDimension: 'both' };
  }

  const baseSize = Math.min(config.width, config.depth);

  if (config.width === config.depth) {
    return {
      isEdgeCase: false,
      baseSize,
      limitingDimension: 'both',
      message: 'Square base: both width and depth affect pattern',
    };
  }

  const limitingDimension = config.width < config.depth ? 'width' : 'depth';
  const unusedDimension = limitingDimension === 'width' ? 'depth' : 'width';

  return {
    isEdgeCase: true,
    baseSize,
    limitingDimension,
    message: `Base size limited by ${limitingDimension} (${baseSize}cm). ` +
             `Changing ${unusedDimension} has no effect unless it becomes < ${baseSize}cm.`,
  };
}

/**
 * Get recommended parameter ranges for a shape
 */
export function getRecommendedRanges(shapeType: ShapeType): Record<string, { min: number; max: number; step: number; default: number }> {
  const ranges: Record<string, Record<string, { min: number; max: number; step: number; default: number }>> = {
    box: {
      width: { min: 1, max: 20, step: 0.5, default: 5 },
      height: { min: 1, max: 20, step: 0.5, default: 3 },
      depth: { min: 1, max: 20, step: 0.5, default: 5 },
      thickness: { min: 0.1, max: 5, step: 0.1, default: 0.5 },
    },
    pyramid: {
      width: { min: 2, max: 15, step: 0.5, default: 6 },
      height: { min: 2, max: 15, step: 0.5, default: 5 },
      depth: { min: 2, max: 15, step: 0.5, default: 6 },  // Recommend same as width
      thickness: { min: 0.1, max: 3, step: 0.1, default: 0.5 },
    },
    prism: {
      width: { min: 2, max: 15, step: 0.5, default: 4 },
      height: { min: 2, max: 20, step: 0.5, default: 6 },
      depth: { min: 1, max: 20, step: 0.5, default: 4 },  // Not used, but keep for consistency
      thickness: { min: 0.1, max: 3, step: 0.1, default: 0.5 },
    },
    cylinder: {
      width: { min: 2, max: 15, step: 0.5, default: 5 },
      height: { min: 2, max: 20, step: 0.5, default: 7 },
      depth: { min: 1, max: 20, step: 0.5, default: 5 },  // Not used
      thickness: { min: 0.1, max: 3, step: 0.1, default: 0.5 },
    },
    envelope: {
      width: { min: 5, max: 25, step: 0.5, default: 16 },
      height: { min: 1, max: 20, step: 0.5, default: 11 },  // Not used
      depth: { min: 5, max: 20, step: 0.5, default: 11 },
      thickness: { min: 0.1, max: 1, step: 0.05, default: 0.3 },
    },
  };

  return ranges[shapeType] || ranges.box;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  PARAMETER_USAGE,
  validateParameterBehavior,
  validateAllShapes,
  formatBehaviorReport,
  formatAllShapesReport,
  detectPyramidEdgeCase,
  getRecommendedRanges,
};
