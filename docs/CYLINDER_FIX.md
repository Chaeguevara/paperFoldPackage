# Cylinder Pattern Fix

## Problem

The "cylinder" shape type was **not actually generating a cylinder** - it was just redirecting to the hexagonal prism pattern.

```typescript
// OLD CODE (geometry.ts:586-588)
case 'cylinder':
  // Cylinders are challenging for glue-free; use prism approximation
  return generatePrismPattern({ ...config, shapeType: 'prism' });
```

This meant:
- ❌ User selects "Cylinder" but gets a hexagon
- ❌ Not a true cylinder at all
- ❌ Confusing and misleading

## Solution

Created a new `generateCylinderPattern()` function that generates a **true cylinder** pattern.

### Pattern Structure

```
┌──────────────────────────────────┐
│       TOP CIRCLE (12-gon)        │  ← Approximated as 12-sided polygon
│         with radial tabs         │     (foldable, close to circular)
├──────────────────────────────────┤
│                                  │
│         MAIN BODY                │  ← Rectangle that wraps around
│    (width = circumference)       │     width = 2πr, height = cylinder height
│                                  │
│  ┌─┐  ← Tab on right edge       │
│  └─┘     (tucks into left slit)  │
│                                  │
├──────────────────────────────────┤
│      BOTTOM CIRCLE (12-gon)      │  ← Same as top
│         with radial tabs         │
└──────────────────────────────────┘
```

### Key Features

1. **Wrapped Body**:
   - Rectangle with width = 2π × radius (full circumference)
   - Height = cylinder height
   - Wraps around to form cylinder

2. **Vertical Closure**:
   - Tab on right edge (tapered 0.7 ratio)
   - Slit on left edge
   - Mountain fold allows tab to tuck in
   - **Glue-free assembly**

3. **Top/Bottom Circles**:
   - Approximated as 12-sided polygons (easier to fold than true curves)
   - Radial tabs extend from circle to body edge
   - Valley folds allow caps to attach at top/bottom

4. **Formula**:
   ```typescript
   const radius = width / 2;
   const circumference = 2 * Math.PI * radius;
   const bodyWidth = circumference;
   const bodyHeight = height;
   ```

## Parameters

| Parameter | Used? | Purpose |
|-----------|-------|---------|
| **width** | ✅ Yes | Cylinder diameter (radius = width/2) |
| **height** | ✅ Yes | Cylinder height |
| **depth** | ❌ No | Not needed (cylinders defined by 2 params) |
| **thickness** | ⚠️ Validation only | Used in theorem checks, not pattern generation |

**Recommendation**: Hide depth slider for cylinder (depth parameter is meaningless for cylinders).

## Assembly Instructions

1. **Cut out pattern** along red cut lines
2. **Fold body** along mountain fold (vertical tab)
3. **Wrap body** into cylinder shape
4. **Insert tab** into slit on opposite edge
5. **Fold top circle tabs** inward along valley folds
6. **Attach top** by tucking tabs into cylinder body
7. **Repeat for bottom circle**

**Result**: Free-standing cylinder with no glue required!

## Code Changes

### File: `src/core/geometry.ts`

**Added**:
- New function `generateCylinderPattern()` (lines 569-725)
- True cylinder generation with:
  - Wrapped rectangular body
  - Vertical tab/slit closure
  - 12-sided circular caps with radial tabs

**Modified**:
- `generatePattern()` switch statement - now calls `generateCylinderPattern()` instead of `generatePrismPattern()`

### File: `src/core/parameterValidator.ts`

**Modified**:
- Updated cylinder notes: "True cylinder with wrapped body - only uses width (diameter) and height"

### File: `docs/PARAMETER_BEHAVIOR.md`

**Modified**:
- Updated cylinder section with new implementation details
- Changed status from "⚠️ Inherits Prism Issues" to "✅ Fixed - True Cylinder Pattern"

## Before vs After

### Before
```typescript
generatePattern({ shapeType: 'cylinder', width: 5, height: 10 })
// Returns: Hexagonal prism (6 flat sides)
```

### After
```typescript
generatePattern({ shapeType: 'cylinder', width: 5, height: 10 })
// Returns: True cylinder pattern
//   - Body: 15.7cm wide (2π × 2.5), 10cm tall
//   - Top/bottom: 12-sided circles with 2.5cm radius
//   - Vertical tab/slit for closure
```

## Testing

```bash
# Run parameter behavior tests
npm run test:behavior

# Check that cylinder now uses width and height correctly
# Verify depth parameter is properly ignored
```

## Visual Comparison

### Hexagonal Prism (Old "Cylinder")
```
   ╱────╲
  ╱      ╲
 │        │  ← 6 flat faces
  ╲      ╱      Clearly NOT a cylinder!
   ╲────╱
```

### True Cylinder (New)
```
   ┌────┐
   │    │  ← Smooth circular cross-section
   │    │     (approximated with 12 segments)
   └────┘
```

## Future Enhancements

1. **Adjustable segments**: Allow user to choose polygon sides (8-24) for circles
2. **Conical shapes**: Extend to truncated cones (different top/bottom radii)
3. **Spiral tabs**: For larger cylinders, use multiple small tabs instead of one long one

## Status

- ✅ **Fixed**: Cylinder now generates true cylinder pattern
- ✅ **Documented**: Updated all relevant documentation
- ✅ **Validated**: Parameter usage correctly documented
- 📝 **Recommended**: Hide depth slider in UI (not used for cylinders)

---

**Summary**: Cylinder is now a **real cylinder**, not a hexagonal prism. The pattern uses a wrapped rectangle with glue-free tab/slit closure and 12-sided circular caps.
