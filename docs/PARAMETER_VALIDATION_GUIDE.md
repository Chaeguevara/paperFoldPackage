# Parameter Validation Guide

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Parameter Behavior Tests

```bash
npm run test:behavior
```

This will validate all shapes and show which parameters actually affect the patterns.

## What Was Created

### 1. Parameter Behavior Documentation
**File**: [PARAMETER_BEHAVIOR.md](./PARAMETER_BEHAVIOR.md)

Comprehensive analysis of how each shape uses (or ignores) width/height/depth parameters.

**Key Findings**:
- **Pyramid**: Uses `min(width, depth)` for base → confusing when width ≠ depth
- **Prism**: Ignores depth completely (hexagon defined by width only)
- **Cylinder**: Inherits prism behavior (depth ignored)
- **Envelope**: Ignores height (2D pattern)

### 2. Parameter Validator Module
**File**: [src/core/parameterValidator.ts](../src/core/parameterValidator.ts)

Runtime validation that detects:
- Which parameters actually affect the pattern
- Which parameters should be hidden from UI
- Edge cases (like pyramid's min() behavior)

**Functions**:
```typescript
// Validate a single config
validateParameterBehavior(config) → BehaviorValidation

// Validate all shapes
validateAllShapes() → Record<ShapeType, BehaviorValidation>

// Detect pyramid edge case
detectPyramidEdgeCase(config) → EdgeCaseInfo

// Get recommended ranges per shape
getRecommendedRanges(shapeType) → ParameterRanges
```

### 3. Test Script
**File**: [src/scripts/testParameterBehavior.ts](../src/scripts/testParameterBehavior.ts)

Automated testing that:
- Validates all shapes with default configs
- Tests pyramid edge cases
- Lists parameters that should be hidden
- Reports issues

## Test Output Example

```
🔍 Testing Parameter Behavior Across All Shapes

=== Parameter Behavior: pyramid ===

Parameter Tests:
  width:
    - ✓ Affects pattern
    - Show in UI
  height:
    - ✓ Affects pattern
    - Show in UI
  depth:
    - ✓ Affects pattern
    - Show in UI
  thickness:
    - ✗ No effect
    - Show in UI

Warnings:
  - Pyramid uses min(width=5, depth=5) = 5cm. Changing depth has no effect unless it becomes smaller.

Recommendations:
  - Set width = depth for predictable behavior, or fix pyramid to use separate dimensions
  - Thickness only used in validation, not pattern generation

📊 Pyramid Edge Case Detection

Width: 5cm, Depth: 5cm
  Base size: 5cm
  Limiting: both
  ✓  Square base: both width and depth affect pattern

Width: 10cm, Depth: 5cm
  Base size: 5cm
  Limiting: width
  ⚠️  Base size limited by width (5cm). Changing depth has no effect unless it becomes < 5cm.

Width: 5cm, Depth: 10cm
  Base size: 5cm
  Limiting: depth
  ⚠️  Base size limited by depth (5cm). Changing width has no effect unless it becomes < 5cm.
```

## Integration with UI

### Option 1: Conditionally Hide Parameters (Recommended)

Update `ConfigPanel.tsx`:

```tsx
import { PARAMETER_USAGE } from '@/core/parameterValidator';

export function ConfigPanel({ config, onChange, hideShapeType = false }: ConfigPanelProps) {
  const usage = PARAMETER_USAGE[config.shapeType];

  return (
    <div className="config-panel">
      <h3>Pattern Configuration</h3>

      {/* ... shape selector ... */}

      <div className="config-field">
        <label htmlFor="width">Width (cm)</label>
        {/* width always shown */}
      </div>

      {usage.height && (
        <div className="config-field">
          <label htmlFor="height">Height (cm)</label>
          {/* Only show if shape uses height */}
        </div>
      )}

      {usage.depth && (
        <div className="config-field">
          <label htmlFor="depth">Depth (cm)</label>
          {/* Only show if shape uses depth */}
        </div>
      )}

      {/* thickness always shown */}
    </div>
  );
}
```

### Option 2: Show Warnings

Add real-time warnings to the UI:

```tsx
import { validateParameterBehavior } from '@/core/parameterValidator';

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const validation = validateParameterBehavior(config);

  return (
    <div className="config-panel">
      {/* ... parameters ... */}

      {validation.warnings.length > 0 && (
        <div className="warnings">
          {validation.warnings.map((warn, i) => (
            <div key={i} className="warning">⚠️ {warn}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Option 3: Add to ValidationPanel

Combine with theorem validation:

```tsx
import { validatePattern } from '@/core/theorems';
import { validateParameterBehavior } from '@/core/parameterValidator';

export function ValidationPanel({ config }: ValidationPanelProps) {
  const pattern = generatePattern(config);
  const theoremValidation = validatePattern(pattern, config);
  const behaviorValidation = validateParameterBehavior(config);

  return (
    <div className="validation-panel">
      {/* Theorem validation results */}

      <details className="behavior-validation">
        <summary>Parameter Behavior</summary>
        {behaviorValidation.tests.map(test => (
          <div key={test.parameter}>
            {test.parameter}: {test.actuallyAffectsPattern ? '✓ Active' : '✗ Inactive'}
          </div>
        ))}
      </details>
    </div>
  );
}
```

## Fixing the Issues

### Quick Fix: Hide Unused Parameters

Minimal changes to `ConfigPanel.tsx`:

```tsx
// Add to ConfigPanel.tsx
const parameterConfig: Record<ShapeType, { height: boolean; depth: boolean }> = {
  box: { height: true, depth: true },
  pyramid: { height: true, depth: true },
  prism: { height: true, depth: false },
  cylinder: { height: true, depth: false },
  envelope: { height: false, depth: true },
};

const showParam = parameterConfig[config.shapeType];

// Then wrap height/depth in conditionals
{showParam.height && (
  <div className="config-field">...</div>
)}

{showParam.depth && (
  <div className="config-field">...</div>
)}
```

### Complete Fix: Update Geometry Logic

For pyramid to use both width and depth:

```typescript
// geometry.ts - generatePyramidPattern()

// BEFORE (line 287):
const baseSize = Math.min(width, depth);

// AFTER - Option A: Use width for base, keep square
const baseSize = width;

// AFTER - Option B: Support rectangular base
const baseWidth = width;
const baseDepth = depth;

// Update all calculations to use separate dimensions
const baseBL = v2(-baseWidth / 2, -baseDepth / 2);
const baseBR = v2(baseWidth / 2, -baseDepth / 2);
const baseTR = v2(baseWidth / 2, baseDepth / 2);
const baseTL = v2(-baseWidth / 2, baseDepth / 2);

// Calculate slant heights for each direction
const slantHeightX = Math.sqrt(height ** 2 + (baseWidth / 2) ** 2);
const slantHeightZ = Math.sqrt(height ** 2 + (baseDepth / 2) ** 2);

// Update apex positions
const apexFront = v2(0, baseDepth / 2 + slantHeightZ);
const apexBack = v2(0, -baseDepth / 2 - slantHeightZ);
const apexLeft = v2(-baseWidth / 2 - slantHeightX, 0);
const apexRight = v2(baseWidth / 2 + slantHeightX, 0);
```

## Decision Matrix

| Fix Strategy | Effort | User Impact | Maintains Tradition |
|-------------|--------|-------------|---------------------|
| Hide unused params | Low | High (less confusion) | Yes |
| Add warnings | Low | Medium | Yes |
| Fix pyramid logic | Medium | High (more control) | No (changes from square) |
| Fix prism to use depth | Medium | Medium | No (hexagon → rect) |
| Document & accept | Very low | Low | Yes |

**Recommendation**:
1. **Short term**: Hide unused parameters (Option 1)
2. **Medium term**: Add pyramid warning for min() behavior (Option 2)
3. **Long term**: Consider fixing pyramid to support rectangular base (Option 3B)

## Running the Tests

### Manual Test in Browser

1. Start dev server: `npm run dev`
2. Open browser console
3. Import and run:
   ```javascript
   import { formatAllShapesReport } from '/src/core/parameterValidator.ts';
   console.log(formatAllShapesReport());
   ```

### Automated Test

```bash
# After installing tsx
npm run test:behavior
```

Expected output shows:
- Which parameters affect each shape
- Which parameters should be hidden
- Pyramid edge case detection
- Recommendations for fixes

## Files Summary

| File | Purpose | Type |
|------|---------|------|
| `docs/PARAMETER_BEHAVIOR.md` | Analysis of parameter issues | Documentation |
| `src/core/parameterValidator.ts` | Validation logic | Code |
| `src/scripts/testParameterBehavior.ts` | Test runner | Script |
| `docs/PARAMETER_VALIDATION_GUIDE.md` | This file | Documentation |

## Next Steps

1. **Run tests**: `npm run test:behavior` to see current behavior
2. **Review findings**: Read the console output
3. **Choose fix**: Decide between hiding params vs fixing logic
4. **Implement**: Update `ConfigPanel.tsx` or `geometry.ts`
5. **Validate**: Run tests again to confirm fixes

## Integration with Theorem System

The parameter validator complements the theorem system:

- **Theorems** ([src/core/theorems.ts](../src/core/theorems.ts)): Validate mathematical correctness
- **Parameter validator** ([src/core/parameterValidator.ts](../src/core/parameterValidator.ts)): Validate UI/UX correctness

Both should run before export:

```typescript
const handleExportSVG = useCallback(() => {
  const pattern = generatePattern(config);

  // Check theorems
  const theoremValidation = validatePattern(pattern, config);
  if (!theoremValidation.overall) {
    alert('Pattern violates mathematical theorems!');
    return;
  }

  // Check parameter behavior
  const behaviorValidation = validateParameterBehavior(config);
  if (behaviorValidation.warnings.length > 0) {
    const proceed = confirm(
      `Warnings:\n${behaviorValidation.warnings.join('\n')}\n\nExport anyway?`
    );
    if (!proceed) return;
  }

  // Export...
}, [config]);
```

## Questions?

See also:
- [PARAMETER_BEHAVIOR.md](./PARAMETER_BEHAVIOR.md) - Detailed analysis
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Theorem system overview
- [theorems/README.md](./theorems/README.md) - Theorem documentation
