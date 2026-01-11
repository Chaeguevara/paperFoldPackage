# Parameter Behavior Analysis

## Issue: Inconsistent Parameter Effects Across Shapes

### Problem Statement

Different shapes respond differently to width/height/depth changes, causing confusion:
- **Pyramid**: Changing width doesn't affect pattern if width > depth
- **Prism**: Depth parameter has no effect (not used)
- **Cylinder**: Uses prism approximation, inherits prism issues

## Current Behavior by Shape

### Box ✅ Correct

```typescript
// geometry.ts:120-122
const { width, height, depth } = config;
const tabDepth = Math.min(width, height, depth) * 0.15;
```

**Parameters used**:
- ✅ **width**: Box width (X dimension)
- ✅ **height**: Box height (Y dimension, vertical)
- ✅ **depth**: Box depth (Z dimension)
- ✅ **thickness**: Tab calculations (validation only)

**Behavior**: All parameters affect the pattern correctly.

---

### Pyramid ⚠️ Issue Found

```typescript
// geometry.ts:285-287
const { width, depth, height } = config;
const baseSize = Math.min(width, depth);  // ⚠️ Uses minimum!
const slantHeight = Math.sqrt(height * height + (baseSize / 2) * (baseSize / 2));
```

**Parameters used**:
- ⚠️ **width**: Only affects base if width < depth
- ⚠️ **depth**: Only affects base if depth < width
- ✅ **height**: Pyramid height (triangle slant)
- ❌ **thickness**: Not used

**Problem**:
```
If width=10, depth=5:
  baseSize = min(10, 5) = 5
  → Pyramid base is 5×5

Change width to 15:
  baseSize = min(15, 5) = 5
  → No change! Pattern identical

Change depth to 8:
  baseSize = min(15, 8) = 8
  → NOW pattern changes
```

**Expected**: Width and depth should create rectangular base, or width should always be used.

---

### Prism ⚠️ Issue Found

```typescript
// geometry.ts:494-497
const { width, height } = config;
const radius = width / 2;
const tabDepth = radius * 0.15;
```

**Parameters used**:
- ✅ **width**: Hexagon radius (diameter)
- ✅ **height**: Prism height (extrusion)
- ❌ **depth**: Not used at all! (silently ignored)
- ❌ **thickness**: Not used

**Problem**:
```
User adjusts depth slider:
  → UI shows depth changing
  → Pattern stays exactly the same
  → Confusing!
```

**Expected**: Either use depth or hide the depth slider for prism.

---

### Cylinder ✅ Fixed - True Cylinder Pattern

```typescript
// geometry.ts - generateCylinderPattern()
const { width, height } = config;
const radius = width / 2;
const circumference = 2 * Math.PI * radius;
```

**Parameters used**:
- ✅ **width**: Cylinder diameter (radius = width/2)
- ✅ **height**: Cylinder height (body length)
- ❌ **depth**: Not used (cylinders only need diameter + height)
- ❌ **thickness**: Not used in generation

**Pattern Structure**:
- Main body: Rectangle with width = circumference, height = cylinder height
- Closure: Vertical tab/slit on edges for wrapping
- Top/bottom circles: Approximated as 12-sided polygons with radial tabs

**Previous Issue**: Was incorrectly using hexagonal prism approximation
**Status**: ✅ Now generates true wrapped cylinder pattern

---

### Envelope ✅ Partial Correct

```typescript
// geometry.ts:389-395
const { width, depth } = config;
const bodyWidth = width;
const bodyDepth = depth * 0.6;  // Main body is 60% of total depth
const flapDepth = depth * 0.25; // Side flaps
const topFlapDepth = depth * 0.35;
const bottomFlapDepth = depth * 0.3;
```

**Parameters used**:
- ✅ **width**: Envelope width
- ✅ **depth**: Envelope depth (height when flat)
- ❌ **height**: Not used (envelopes are 2D)
- ❌ **thickness**: Not used

**Problem**: Height slider shown but has no effect.

**Expected**: Hide height slider for envelope.

---

## Summary Table

| Shape    | Width | Height | Depth | Thickness | Issue |
|----------|-------|--------|-------|-----------|-------|
| Box      | ✅    | ✅     | ✅    | ⚠️ Validate only | None |
| Pyramid  | ⚠️    | ✅     | ⚠️    | ❌ Ignored | Uses min(w,d) - confusing |
| Prism    | ✅    | ✅     | ❌    | ❌ Ignored | Depth ignored (hexagon) |
| Cylinder | ✅    | ✅     | ❌    | ❌ Ignored | Depth not needed (2 params define cylinder) |
| Envelope | ✅    | ❌     | ✅    | ❌ Ignored | Height ignored (2D pattern) |

Legend:
- ✅ Used correctly
- ⚠️ Used but confusing behavior
- ❌ Not used (slider shown but no effect)

## Recommended Fixes

### Option 1: Hide Unused Parameters (Recommended)

Update `ConfigPanel` to hide sliders based on shape type:

```typescript
// ConfigPanel.tsx
const parameterConfig = {
  box: { width: true, height: true, depth: true },
  pyramid: { width: true, height: true, depth: true },  // Keep all for now
  prism: { width: true, height: true, depth: false },   // Hide depth
  cylinder: { width: true, height: true, depth: false }, // Hide depth
  envelope: { width: true, height: false, depth: true }, // Hide height
};

const showParam = parameterConfig[config.shapeType];
```

**Pros**: Users only see parameters that actually work
**Cons**: Need to update UI logic

---

### Option 2: Fix Pyramid to Use Both Dimensions

Change pyramid to use separate width/depth:

```typescript
// geometry.ts:287 - BEFORE
const baseSize = Math.min(width, depth);

// AFTER
const baseWidth = width;
const baseDepth = depth;
const slantHeightX = Math.sqrt(height * height + (baseWidth / 2) * (baseWidth / 2));
const slantHeightZ = Math.sqrt(height * height + (baseDepth / 2) * (baseDepth / 2));
```

**Pros**: All parameters work as expected
**Cons**: Creates rectangular pyramid (not traditional square pyramid)

---

### Option 3: Add Clear Documentation

Add tooltips/help text explaining behavior:

```tsx
<label htmlFor="width">
  Width (cm)
  {config.shapeType === 'pyramid' && (
    <span className="help-text">
      Pyramid uses min(width, depth) for square base
    </span>
  )}
</label>
```

**Pros**: Quick fix, no logic changes
**Cons**: Doesn't solve the confusing behavior

---

## Validation Skill Requirements

A validation skill should check:

1. **Parameter Usage**:
   - Which parameters actually affect the pattern?
   - Are unused parameters hidden from UI?

2. **Behavior Consistency**:
   - Does changing parameter X always change the pattern?
   - Are there edge cases (min/max conditions)?

3. **Visual Feedback**:
   - Does 3D preview update correctly?
   - Does 2D pattern (전개도) update correctly?

4. **Tooltip Accuracy**:
   - Do labels match actual behavior?
   - Are units correct (cm vs mm)?

5. **Theorem Compliance**:
   - After parameter change, does pattern still validate?
   - Are constraints documented?

## Test Cases

### Test 1: Pyramid Width Independence
```typescript
const config1 = { shapeType: 'pyramid', width: 5, depth: 10, height: 8, thickness: 0.5 };
const config2 = { shapeType: 'pyramid', width: 15, depth: 10, height: 8, thickness: 0.5 };

const pattern1 = generatePattern(config1);
const pattern2 = generatePattern(config2);

// Expected: pattern1 === pattern2 (both use baseSize=5)
// Current: ✅ This is what happens (but it's confusing!)
```

### Test 2: Prism Depth Irrelevance
```typescript
const config1 = { shapeType: 'prism', width: 5, height: 10, depth: 3, thickness: 0.5 };
const config2 = { shapeType: 'prism', width: 5, height: 10, depth: 99, thickness: 0.5 };

const pattern1 = generatePattern(config1);
const pattern2 = generatePattern(config2);

// Expected: pattern1 === pattern2 (depth ignored)
// Current: ✅ This is what happens (but it's confusing!)
```

### Test 3: Envelope Height Irrelevance
```typescript
const config1 = { shapeType: 'envelope', width: 16, height: 5, depth: 11, thickness: 0.3 };
const config2 = { shapeType: 'envelope', width: 16, height: 50, depth: 11, thickness: 0.3 };

const pattern1 = generatePattern(config1);
const pattern2 = generatePattern(config2);

// Expected: pattern1 === pattern2 (height ignored)
// Current: ✅ This is what happens (but it's confusing!)
```

## Implementation Status

- ❌ Parameter behavior not validated
- ❌ Unused parameters still shown in UI
- ❌ No tooltips explaining confusing behaviors
- ❌ No warnings when parameter has no effect
- ❌ Documentation doesn't mention these quirks

## Proposed Validation Function

```typescript
// src/core/theorems.ts
export function validateParameterBehavior(config: PatternConfig): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'parameter-behavior',
    errors: [],
    warnings: [],
    details: {},
  };

  // Check for unused parameters
  switch (config.shapeType) {
    case 'pyramid':
      if (config.width !== config.depth) {
        const baseSize = Math.min(config.width, config.depth);
        const unused = config.width > config.depth ? 'width' : 'depth';
        result.warnings.push(
          `Pyramid uses min(width, depth) = ${baseSize}cm. ` +
          `${unused} value is ignored. Set both equal for square base.`
        );
      }
      break;

    case 'prism':
    case 'cylinder':
      if (config.depth !== 5) {  // Default value
        result.warnings.push(
          `${config.shapeType} does not use depth parameter (hexagon is defined by width only)`
        );
      }
      break;

    case 'envelope':
      if (config.height !== 3) {  // Default value
        result.warnings.push(
          'Envelope does not use height parameter (2D pattern defined by width × depth)'
        );
      }
      break;
  }

  return result;
}
```

## Next Steps

1. **Decide on fix strategy**: Hide params vs fix logic vs document
2. **Update ConfigPanel**: Conditionally show/hide sliders
3. **Add validation**: Warn users about ignored parameters
4. **Update documentation**: Explain parameter usage per shape
5. **Create skill**: Automate behavior validation testing
