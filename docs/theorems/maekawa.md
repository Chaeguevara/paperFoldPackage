# Maekawa's Theorem

## Overview

Maekawa's Theorem provides a fundamental constraint on mountain and valley fold assignment at vertices in flat-foldable origami. It complements Kawasaki-Justin by governing the **balance** between fold types, not just their angles.

---
id: maekawa
category: flat-foldability
priority: critical
applies_to: [vertex_folds, mountain_valley_assignment]
implementation: future (not yet implemented)
source: Maekawa, Jun. "On the Maekawa-Justin Condition" (1989)
---

## Mathematical Definition

### The Theorem

At any interior vertex of a flat-foldable crease pattern:

**Formula**:
```
V - M = ±2
```

Where:
- `V` = number of valley folds meeting at the vertex
- `M` = number of mountain folds meeting at the vertex
- `±2` depends on vertex orientation after folding

### Sign Convention

- **+2**: Vertex is **concave** (points inward when folded)
- **-2**: Vertex is **convex** (points outward when folded)

Equivalently:
```
|V - M| = 2
```

The absolute value form is often used when orientation isn't predetermined.

## Relationship to Kawasaki-Justin

These two theorems work together to ensure flat-foldability:

| Theorem | Governs | Constraint |
|---------|---------|------------|
| **Kawasaki-Justin** | Angles | Alternating angles sum to 180° |
| **Maekawa** | Fold Types | Mountain-valley balance = ±2 |

**Both must be satisfied** for a vertex to be flat-foldable.

### Example: Square Vertex

```
    Fold 1
      │
      │ (Valley)
      │
──────┼────── Fold 2 (Mountain)
      │
      │ (Valley)
      │
    Fold 3
      │
    Fold 4 (Mountain)
```

**Kawasaki Check**:
- 4 folds at 90° each
- Alternating sums: 90° + 90° = 180° ✓

**Maekawa Check**:
- V = 2 (valleys), M = 2 (mountains)
- V - M = 2 - 2 = 0 ✗

**Problem**: This vertex is **NOT** flat-foldable!

**Fix**: Change one fold type:
- V = 3, M = 1 → V - M = 2 ✓

## Connection to Our Implementation

### Current Status

Our assembly patterns use mountain/valley folds, but we **don't validate Maekawa's theorem**:

```typescript
// geometry.ts:74 - Tab base is always mountain
fold(baseStart, baseEnd, 'mountain')
```

We assign fold types based on **assembly mechanics**, not mathematical validation.

### Why This Matters

**Potential Issue**: Our patterns might violate Maekawa at some vertices.

**Impact**:
- Pattern may not fold flat
- Physical assembly could fail
- Paper buckles or tears

### Validation Function (Proposed)

```typescript
// src/core/theorems.ts

export function validateMaekawa(pattern: FoldPattern): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'maekawa',
    errors: [],
    warnings: [],
  };

  const vertices = extractVertices(pattern.foldLines);

  vertices.forEach(vertex => {
    const connected = findConnectedLines(vertex, pattern.foldLines);

    // Count mountains and valleys
    const mountains = connected.filter(l => l.type === 'mountain').length;
    const valleys = connected.filter(l => l.type === 'valley').length;

    const difference = Math.abs(valleys - mountains);

    // Check Maekawa condition
    if (connected.length >= 4 && difference !== 2) {
      result.valid = false;
      result.errors.push(
        `Vertex at (${vertex.x.toFixed(2)}, ${vertex.z.toFixed(2)}) violates Maekawa:\n` +
        `  V=${valleys}, M=${mountains}, |V-M|=${difference} (should be 2)`
      );
    }
  });

  return result;
}
```

## Proof Sketch (Educational)

**Why must |V - M| = 2?**

Consider folding a vertex flat:

1. **Total folds must be even**: Can't fold flat with odd number of creases
2. **Alternating pattern**: M-V-M-V-... around vertex
3. **Closed loop**: Must return to starting orientation after going 360°

**Mathematical reasoning**:

If we have `n` folds total (n is even), with `V` valleys and `M` mountains:

```
V + M = n
```

After flat-folding, the paper makes a full 360° turn around the vertex. Each fold contributes either +180° (mountain) or -180° (valley) to the cumulative angle.

For the pattern to close properly:

```
M × (+180°) + V × (-180°) = ±360°
(M - V) × 180° = ±360°
M - V = ±2
```

Therefore: **V - M = ±2**

## Practical Application

### Box Pattern Validation

Our box pattern has vertices where 4 folds meet (bottom corners):

```typescript
// At bottom-left corner (baseBL):
// 4 mountain folds meet:
//   - To baseBR (bottom edge)
//   - To baseTL (left edge)
//   - To back face
//   - To left face

// Maekawa check:
V = 0, M = 4
|V - M| = 4 ✗ INVALID!
```

**Problem**: All mountain folds violates Maekawa!

**Why doesn't it fail?**

These vertices are **perimeter vertices**, not interior vertices. Maekawa only applies to **interior vertices** (surrounded by paper on all sides).

### Interior Vertex Example

If we add a lid with tab attachment:

```
     │ Mountain (lid edge)
     │
─────┼───── Valley (tab fold)
     │
     │ Mountain (box edge)
     │
   Valley (internal crease)
```

**Maekawa check**:
- V = 2 (valleys)
- M = 2 (mountains)
- |V - M| = 0 ✗

**Fix required**: Change one fold to valley or mountain to achieve ±2 difference.

## Implementation Priority

### Current App

**Priority**: Medium

**Rationale**:
- Simple shapes (box, pyramid) mostly use perimeter vertices
- Most fold assignments are mechanically determined (tabs = mountain)
- Violations would cause folding issues, but assembly might still work

### Future Tree-Based Design

**Priority**: Critical

**Rationale**:
- Complex bases have many interior vertices
- Automated fold assignment requires Maekawa validation
- Without this, generated patterns may be unfoldable

## Integration Steps

1. **Add validation function** to `src/core/theorems.ts`
2. **Update `validatePattern`** to include Maekawa check
3. **Distinguish vertex types**: Interior vs perimeter
4. **Report violations** with suggested fixes
5. **Auto-correct**: Flip fold types to satisfy theorem (future)

### Example Usage

```typescript
import { validateMaekawa } from '@/core/theorems';

const pattern = generatePattern(config);
const maekawaResult = validateMaekawa(pattern);

if (!maekawaResult.valid) {
  console.warn('Pattern violates Maekawa theorem:');
  maekawaResult.errors.forEach(err => console.error(err));
}
```

## Machine-Readable Summary

```yaml
theorem:
  id: maekawa
  name: Maekawa's Theorem
  type: flat-foldability
  author: Jun Maekawa
  year: 1989

formula:
  simple: "|V - M| = 2"
  detailed: "V - M = ±2"
  variables:
    V: "Number of valley folds at vertex"
    M: "Number of mountain folds at vertex"
    sign: "Depends on vertex orientation (concave/convex)"

constraints:
  applies_to: interior_vertices_only
  minimum_folds: 4
  fold_types: [mountain, valley]

validation:
  function: validateMaekawa
  input: FoldPattern
  output: ValidationResult
  implemented: false
  priority: medium

relationship:
  complements: kawasaki-justin
  required_for: tree_theorem
  validates: mountain_valley_assignment

failure_modes:
  all_mountains: "|V - M| = M ≠ 2"
  all_valleys: "|V - M| = V ≠ 2"
  equal_split: "|V - M| = 0 ≠ 2"
  off_by_one: "|V - M| = 1 ≠ 2"
```

## References

1. Maekawa, J. (1989). "On the Maekawa-Justin Condition". In *Origami Science and Art* (pp. 67-72).
2. Hull, T.C. (1994). "On the Mathematics of Flat Origamis". *Congressus Numerantium*, 100, 215-224.
3. Demaine, E.D., & O'Rourke, J. (2007). *Geometric Folding Algorithms*. Cambridge University Press.
4. Lang, R.J. (2011). *Origami Design Secrets* (2nd ed.). CRC Press. (Chapter 3)

## Educational Note

Maekawa's Theorem, combined with Kawasaki-Justin, forms the **foundation of flat-foldable origami mathematics**. These two simple rules govern whether any crease pattern can physically fold flat.

**Historical Context**:
- Discovered independently by Jun Maekawa (Japan) and Jacques Justin (France)
- Often called "Maekawa-Justin Theorem" to credit both
- Essential for computational origami design

**Practical Significance**:
- Enables automated validation of crease patterns
- Guides manual fold-type assignment
- Prevents design of impossible patterns

**For this app**: Currently not critical (simple shapes), but essential for future advanced features (custom tree-based designs).

---

**Source**: This document summarizes well-established mathematical principles in origami theory, based on cited academic publications. No copyrighted material is reproduced.
