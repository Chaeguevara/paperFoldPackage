/**
 * Test Parameter Behavior
 *
 * Run this script to validate parameter behavior across all shapes.
 * Usage: npx tsx src/scripts/testParameterBehavior.ts
 */

import {
  validateAllShapes,
  formatAllShapesReport,
  detectPyramidEdgeCase,
} from '../core/parameterValidator';
import type { PatternConfig } from '../types';

console.log('🔍 Testing Parameter Behavior Across All Shapes\n');
console.log('='.repeat(70));
console.log();

// Test all shapes with default configs
const report = formatAllShapesReport();
console.log(report);

console.log('='.repeat(70));
console.log('\n📊 Pyramid Edge Case Detection\n');

// Test pyramid with various width/depth combinations
const pyramidTests: Array<{ width: number; depth: number }> = [
  { width: 5, depth: 5 },   // Square base
  { width: 10, depth: 5 },  // Width limiting
  { width: 5, depth: 10 },  // Depth limiting
  { width: 8, depth: 12 },  // Width limiting
];

pyramidTests.forEach(({ width, depth }) => {
  const config: PatternConfig = {
    shapeType: 'pyramid',
    width,
    height: 8,
    depth,
    thickness: 0.5,
  };

  const edgeCase = detectPyramidEdgeCase(config);

  console.log(`Width: ${width}cm, Depth: ${depth}cm`);
  console.log(`  Base size: ${edgeCase.baseSize}cm`);
  console.log(`  Limiting: ${edgeCase.limitingDimension}`);
  if (edgeCase.message) {
    console.log(`  ${edgeCase.isEdgeCase ? '⚠️' : '✓'}  ${edgeCase.message}`);
  }
  console.log();
});

console.log('='.repeat(70));
console.log('\n📋 Summary\n');

const validations = validateAllShapes();

console.log('Parameters that should be HIDDEN from UI:');
Object.entries(validations).forEach(([shape, validation]) => {
  const hiddenParams = validation.tests
    .filter(t => !t.shouldBeShown)
    .map(t => t.parameter);

  if (hiddenParams.length > 0) {
    console.log(`  ${shape}: ${hiddenParams.join(', ')}`);
  } else {
    console.log(`  ${shape}: (none)`);
  }
});

console.log('\nParameters with ISSUES:');
Object.entries(validations).forEach(([shape, validation]) => {
  const issues = validation.tests.filter(t => t.issue);

  if (issues.length > 0) {
    console.log(`  ${shape}:`);
    issues.forEach(issue => {
      console.log(`    - ${issue.parameter}: ${issue.issue}`);
    });
  }
});

console.log('\n✅ Testing complete!');
