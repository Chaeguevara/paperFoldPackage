# Kawasaki-Justin Theorem

## Overview

The Kawasaki-Justin theorem (also known as Kawasaki's theorem) is a fundamental principle in origami mathematics that determines whether a crease pattern can be flat-folded.

---
id: kawasaki-justin
category: flat-foldability
priority: critical
applies_to: [vertex_angles, fold_lines]
implementation: src/core/geometry.ts:verifyKawasakiJustin
---

## Mathematical Definition

At any interior vertex of a flat-foldable origami pattern, the sum of alternating angles must equal 180° (π radians).

### Formula

Given a vertex `V` with `n` fold lines creating angles `α₁, α₂, α₃, ..., αₙ`:

```
α₁ + α₃ + α₅ + ... = π (180°)
α₂ + α₄ + α₆ + ... = π (180°)
```

### Constraints

- **Minimum folds**: At least 4 fold lines must meet at a vertex for the theorem to apply
- **Angle order**: Angles must be measured consecutively around the vertex
- **Total sum**: All angles around a vertex must sum to 2π (360°)
- **Tolerance**: In practice, ±0.01 radians (~0.57°) tolerance for manufacturing/material constraints

## Why This Matters for Glue-Free Assembly

### Connection to Tab-and-Slit Design

While Kawasaki-Justin is an origami theorem, it directly impacts our glue-free packaging:

1. **Fold Stability**: Patterns that satisfy Kawasaki-Justin fold cleanly without buckling
2. **Tab Alignment**: When tabs fold into slits, the vertices at fold intersections must be flat-foldable
3. **Stress Distribution**: Non-compliant vertices create stress points that weaken tab locks

### Assembly Implications

```yaml
valid_pattern:
  - Tabs align perfectly with slits
  - Folds are crisp and maintain position
  - No material stress at vertices

invalid_pattern:
  - Tabs misalign (gaps or overlaps)
  - Folds buckle or spring back
  - Paper tears at stressed vertices
```

## Implementation in Code

### Validation Function

Reference: [geometry.ts:682-724](../src/core/geometry.ts#L682-L724)

```typescript
export function verifyKawasakiJustin(
  vertex: THREE.Vector3,
  connectedLines: FoldLine[]
): boolean
```

**Algorithm**:
1. Find all fold lines connected to vertex
2. Calculate direction vectors from vertex to each endpoint
3. Sort directions by angle from positive X-axis
4. Calculate angles between consecutive directions
5. Sum alternating angles (even indices vs odd indices)
6. Check if both sums ≈ π within tolerance

### Usage in Pattern Generation

**Box Pattern** [geometry.ts:120-270](../src/core/geometry.ts#L120-L270):
- Bottom face vertices: 4 folds meet (4 × 90° = 360°, alternating sums = 180°)
- Tab attachment vertices: Automatically satisfy theorem due to perpendicular cuts

**Pyramid Pattern** [geometry.ts:285-373](../src/core/geometry.ts#L285-L373):
- Base vertices: 4 triangular faces + base = verified compliant
- Apex (when folded): 4 edges meet at 90° each ✓

## Testing & Validation

### Runtime Checks

The pattern generator should validate each vertex before rendering:

```typescript
// Pseudo-code for validation pipeline
function generatePattern(config: PatternConfig): FoldPattern {
  const pattern = createRawPattern(config);

  // Validate all vertices
  const vertices = extractVertices(pattern.foldLines);
  vertices.forEach(vertex => {
    const connected = findConnectedLines(vertex, pattern.foldLines);
    if (!verifyKawasakiJustin(vertex, connected)) {
      throw new Error(`Vertex at ${vertex} violates Kawasaki-Justin theorem`);
    }
  });

  return pattern;
}
```

### Edge Cases

- **Perimeter vertices**: Only 2-3 folds (theorem doesn't apply, always valid)
- **Tab tips**: Usually only 2-3 folds (valid by exemption)
- **Interior cross-folds**: 4+ folds (MUST validate)

## Historical Context

**Toshikazu Kawasaki** (1980s): First proved the alternating angle sum property for flat origami.

**Barry Justin** (1986): Independently proved the same theorem, now jointly credited.

**Relevance to packaging**: Traditional Japanese hakosashi boxes unknowingly used this principle for centuries before mathematical proof.

## References

- Kawasaki, T. (1989). "On the Relation Between Mountain-Creases and Valley-Creases of a Flat Origami"
- Hull, T. C. (2020). "Origami Design Secrets" - Chapter 3: Mathematical Methods
- Lang, R. J. (2018). "Twists, Tilings, and Tessellations" - Vertex angle constraints

## Machine-Readable Summary

```yaml
theorem:
  id: kawasaki-justin
  name: Kawasaki-Justin Theorem
  type: flat-foldability

constraints:
  min_folds: 4
  angle_sum_total: 6.28318530718  # 2π
  alternating_sum_each: 3.14159265359  # π
  tolerance: 0.01

validation:
  function: verifyKawasakiJustin
  input: [vertex_position, connected_fold_lines]
  output: boolean
  throws: false

applies_to:
  patterns: [box, pyramid, prism, envelope]
  vertices: [interior_only]
  exemptions: [perimeter, tab_tips]

impact_on_assembly:
  fold_quality: critical
  tab_alignment: high
  structural_integrity: high
```
