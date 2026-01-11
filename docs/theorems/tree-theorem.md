# Tree Theorem (Uniaxial Base Design)

## Overview

The Tree Theorem, developed by Robert J. Lang, is the fundamental mathematical principle for designing complex origami bases from arbitrary tree graphs. It establishes precise conditions for when a flat sheet can be folded into a uniaxial base with a specified flap configuration.

---
id: tree-theorem
category: advanced-origami
priority: high
applies_to: [complex_bases, flap_design, circle_packing]
implementation: future (not yet implemented)
source: Lang, R.J. "Origami Design Secrets, 2nd ed." (2011)
---

## Mathematical Definition

### The Core Theorem

A crease pattern exists that transforms a unit square into a uniaxial base whose projection is a tree `T` with leaf nodes `P_i` **if and only if**:

**Path Condition**: The distance between any two leaf vertices on the square must be greater than or equal to the scaled distance between their corresponding nodes on the tree.

### Formula

For leaf vertices `u_i` and `u_j` on the paper, and corresponding tree nodes with path distance `l_ij`, with scale factor `m`:

```
|u_i - u_j| ≥ m · l_ij
```

**Variables**:
- `u_i, u_j`: Positions of flap tips on the flat paper (2D coordinates)
- `l_ij`: Tree distance (sum of edge lengths along path from `P_i` to `P_j`)
- `m`: Scale factor (determines overall size/efficiency)

### Geometric Interpretation: Circle Packing

The path condition is equivalent to a **circle packing problem**:

Each flap can be represented as a circle with radius `r_i = m · (path length from root to P_i)`.

**Non-Overlap Condition**: For circles with radii `r_1` and `r_2` separated by distance `d`:

```
d ≥ r_1 + r_2
```

This ensures distinct flaps don't interfere when folded.

## Why This Matters for Package Design

### Connection to Glue-Free Assembly

While our current app focuses on simple geometric shapes (boxes, pyramids), the Tree Theorem provides the **mathematical foundation** for designing custom shapes:

**Current Limitation**:
- Predefined templates (box, pyramid, envelope)
- Fixed topologies

**With Tree Theorem**:
- User specifies desired flap structure (e.g., "6 legs, 2 antennae, 1 body")
- Algorithm computes optimal crease pattern
- Glue-free assembly constraints still apply

### Optimization Problem

The design goal is to **maximize the scale factor `m`** (larger flaps = more useful structure):

```yaml
optimization:
  objective: maximize(m)
  constraints:
    - path_conditions: |u_i - u_j| ≥ m · l_ij for all i,j
    - paper_boundary: u_i must lie within unit square
    - non_overlap: circles(r_i = m · length_i) don't overlap
```

## Implementation Algorithm

### Conceptual Design Pipeline

```python
def design_uniaxial_base(tree_graph, flap_lengths, paper_shape):
    """
    1. OPTIMIZATION: Solve for optimal flap positions
       - Input: Tree structure, desired flap lengths
       - Output: Positions u_i that maximize scale factor m
       - Method: Convex optimization (path constraints are linear)

    2. AXIAL DECOMPOSITION: Identify active paths
       - Active paths: Where |u_i - u_j| = m · l_ij (equality)
       - These become axial creases (divide paper into polygons)

    3. MOLECULE ASSIGNMENT: Fill polygons with fold patterns
       - Triangles → Rabbit-ear molecule
       - Quads → Universal/gusset molecule
       - Higher-order → Subdivide with stubs

    4. CREASE ASSEMBLY: Combine all molecular patterns

    5. MOUNTAIN/VALLEY ASSIGNMENT: Determine fold directions
    """

    # Step 1: Circle packing optimization
    optimal_vertices = solve_circle_packing(
        tree_graph,
        flap_lengths,
        paper_boundary=paper_shape
    )

    # Step 2: Identify active paths (become axial creases)
    active_paths = find_active_paths(optimal_vertices, tree_graph)
    polygons = decompose_into_polygons(active_paths)

    # Step 3: Assign molecules to polygons
    for polygon in polygons:
        if polygon.sides == 3:
            apply_rabbit_ear_molecule(polygon)
        elif polygon.sides == 4:
            apply_universal_molecule(polygon)
        else:
            subdivide_polygon(polygon)

    # Step 4 & 5: Assemble and assign fold types
    crease_pattern = assemble_creases(polygons)
    assign_mountain_valley(crease_pattern)

    return crease_pattern
```

## Related Theorems (Dependencies)

### Maekawa-Justin Theorem

**Critical for molecule design**: At each interior vertex, mountain and valley folds must balance.

**Formula**:
```
V - M = ±2
```

Where:
- `V` = number of valley folds at vertex
- `M` = number of mountain folds at vertex
- Sign depends on whether vertex is convex (+2) or concave (-2)

**Connection**: When assigning fold types in Step 5, this theorem ensures local flat-foldability.

---

### Kawasaki-Justin Theorem

Already documented in [kawasaki-justin.md](./kawasaki-justin.md).

**Reminder**: Alternating angles at a vertex sum to 180°.

**Connection**: Validates that molecule patterns are geometrically valid.

---

## Molecular Patterns

### Rabbit-Ear Molecule (Triangular Polygons)

For a triangle with corners `p_A, p_B, p_C` and opposite side lengths `a, b, c`:

**Peak Vertex Location** (where three creases meet):

```
p_E = [p_A(b+c) + p_B(c+a) + p_C(a+b)] / [2(a+b+c)]
```

This is the weighted average of corner positions, ensuring proper flap alignment.

**Geometric Meaning**:
- Three angle bisectors from corners meet at `p_E`
- Creates three mountain folds radiating from `p_E`
- Each corner becomes a flap tip

---

### Universal Molecule (Quadrilateral Polygons)

More complex than rabbit-ear, handles all quads (not just rectangles).

**Key Property**: Can solve any quadrilateral where opposite tangent points align.

**Implementation**: Requires solving for gusset crease positions (beyond scope of simple formula).

---

## Advanced Techniques

### Pythagorean Stretch (Hybrid Bases)

**Problem**: Circle packing is efficient, but box pleating (grid-based) is easier to fold.

**Solution**: Allow controlled overlap between bounding boxes while maintaining minimum separations.

**Formula** (ridge crease peak distance):

```
t = (s_1 + s_2 - d) / 2
```

Where:
- `s_1, s_2`: Sides of outer bounding boxes
- `d`: Minimum allowed distance between circle centers
- `t`: Distance from box edge to ridge peak

**Application**: Create hybrid designs that combine efficiency of circles with practicality of grid.

---

### Comb Structure (Parametric Filaments)

**Use Case**: Creating multiple thin flaps (legs, antennae) along a shaft.

**Tilt Angle Formula**:

```
α = arcsin(1 / (1 + 2f))
```

Where:
- `α`: Angle of comb creases relative to paper edge
- `f = l/g`: Filament-to-gap ratio (flap length / spacing)

**Example**:
```
For f = 1 (length = gap):
  α = arcsin(1/3) ≈ 19.47°

For f = 2 (length = 2× gap):
  α = arcsin(1/5) ≈ 11.54°
```

---

## Practical Application to Current App

### Phase 1: Basic Tree Structures (Future)

Allow users to specify simple trees:

```typescript
interface TreeNode {
  id: string;
  length: number;
  children: TreeNode[];
}

// Example: Simple insect base
const insectTree: TreeNode = {
  id: 'body',
  length: 5,
  children: [
    { id: 'leg1', length: 3, children: [] },
    { id: 'leg2', length: 3, children: [] },
    { id: 'leg3', length: 3, children: [] },
    { id: 'leg4', length: 3, children: [] },
    { id: 'head', length: 2, children: [
      { id: 'antenna1', length: 1.5, children: [] },
      { id: 'antenna2', length: 1.5, children: [] },
    ]},
  ],
};
```

### Phase 2: Circle Packing Solver

Implement optimization to find `u_i` positions:

```typescript
function solveCirclePacking(
  tree: TreeNode,
  paperWidth: number,
  paperHeight: number
): { vertices: Vector2[], scaleFactor: number } {
  // Linear programming problem:
  // maximize m
  // subject to:
  //   |u_i - u_j| ≥ m · l_ij  for all pairs
  //   0 ≤ u_i.x ≤ paperWidth
  //   0 ≤ u_i.y ≤ paperHeight

  // Use convex optimization library (e.g., GLPK.js)
  const result = optimizeLinearProgram({
    objective: { m: -1 },  // Maximize (minimize negative)
    constraints: generatePathConstraints(tree),
  });

  return result;
}
```

### Phase 3: Molecule Library

Pre-compute molecular patterns for common polygons:

```typescript
const MOLECULES = {
  triangle: (vertices: [Vector2, Vector2, Vector2]) =>
    generateRabbitEarMolecule(vertices),

  rectangle: (vertices: [Vector2, Vector2, Vector2, Vector2]) =>
    generateRectangleMolecule(vertices),

  quad: (vertices: Vector2[]) =>
    generateUniversalMolecule(vertices),
};
```

---

## Validation Against Tree Theorem

```typescript
// src/core/theorems.ts (future addition)

export function validateTreeTheorem(
  tree: TreeNode,
  vertices: Map<string, Vector2>,
  scaleFactor: number
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    theoremId: 'tree-theorem',
    errors: [],
    warnings: [],
  };

  // Check all path conditions
  const pairs = getAllLeafPairs(tree);

  pairs.forEach(([nodeA, nodeB, pathLength]) => {
    const u_i = vertices.get(nodeA.id);
    const u_j = vertices.get(nodeB.id);
    const distance = u_i.distanceTo(u_j);
    const minDistance = scaleFactor * pathLength;

    if (distance < minDistance - TOLERANCE) {
      result.valid = false;
      result.errors.push(
        `Path condition violated: ${nodeA.id} ↔ ${nodeB.id}\n` +
        `  Distance: ${distance.toFixed(3)} < Required: ${minDistance.toFixed(3)}`
      );
    }
  });

  return result;
}
```

---

## Machine-Readable Summary

```yaml
theorem:
  id: tree-theorem
  name: Tree Theorem for Uniaxial Bases
  type: advanced-origami
  author: Robert J. Lang
  source: "Origami Design Secrets, 2nd ed."
  year: 2011

formulas:
  path_condition:
    formula: "|u_i - u_j| >= m * l_ij"
    description: "Distance between flap positions must exceed scaled tree distance"

  circle_non_overlap:
    formula: "d >= r_1 + r_2"
    description: "Equivalent circle packing formulation"

  maekawa_justin:
    formula: "V - M = ±2"
    description: "Mountain-valley balance at vertices"

  rabbit_ear_peak:
    formula: "p_E = [p_A(b+c) + p_B(c+a) + p_C(a+b)] / [2(a+b+c)]"
    description: "Peak vertex for triangular molecule"

  pythagorean_stretch:
    formula: "t = (s_1 + s_2 - d) / 2"
    description: "Ridge crease peak distance in hybrid bases"

  comb_tilt:
    formula: "α = arcsin(1 / (1 + 2f))"
    description: "Tilt angle for parametric comb structures"

implementation_status:
  current: not_implemented
  priority: medium
  dependencies:
    - convex_optimization_library
    - polygon_decomposition
    - molecular_pattern_library

applies_to:
  current_shapes: []
  future_shapes: [custom_tree_bases, insect_models, complex_figures]

educational_value: high
complexity: advanced
```

---

## Educational Content (Fair Use)

**Source Attribution**:

All mathematical principles and formulas presented here are based on the work of **Robert J. Lang** as described in:

> Lang, Robert J. *Origami Design Secrets: Mathematical Methods for an Ancient Art*, 2nd ed. A K Peters/CRC Press, 2011.

This document provides an educational summary of the underlying mathematical theory (Tree Theorem, circle packing, molecular patterns) without reproducing copyrighted diagrams, step-by-step folding instructions, or extensive verbatim text. The goal is to explain the computational foundations that could be implemented in software for origami design.

**Recommended Reading**:

For complete coverage including diagrams, worked examples, and detailed folding sequences, readers should consult the original text.

**Related Resources**:
- TreeMaker software (by Robert J. Lang): Implements these algorithms
- ReferenceFinder: Geometric construction tool
- Origami mathematical research: Erik Demaine, Tomohiro Tachi, Jun Maekawa

---

## Integration with Existing Theorems

### Hierarchy

```
Advanced Theory (Tree Theorem)
    ↓
  Provides mathematical foundation for
    ↓
Intermediate Theory (Kawasaki-Justin, Maekawa)
    ↓
  Ensures geometric validity of
    ↓
Basic Engineering (Assembly Mechanics)
    ↓
  Adds practical constraints for
    ↓
Glue-Free Packaging (Current App)
```

### Compatibility

- **Tree Theorem** generates crease patterns
- **Kawasaki-Justin** validates vertices in those patterns
- **Assembly Mechanics** adds tabs/slits for practical assembly
- **Result**: Computationally-designed, mathematically-valid, physically-assemblable packages

---

## Future Implementation Roadmap

1. **Phase 1**: Document theorem (✓ This file)
2. **Phase 2**: Add circle packing solver (optimization library)
3. **Phase 3**: Implement molecule generators (rabbit-ear, universal)
4. **Phase 4**: Create tree input UI (user specifies flap structure)
5. **Phase 5**: Integrate with existing validation system
6. **Phase 6**: Add glue-free assembly constraints to tree-designed bases

**Estimated Complexity**: High (requires computational geometry expertise)

**Educational Value**: Very High (demonstrates real-world application of advanced math)

---

## References

1. Lang, R.J. (2011). *Origami Design Secrets* (2nd ed.). CRC Press.
2. Demaine, E.D., & O'Rourke, J. (2007). *Geometric Folding Algorithms*. Cambridge University Press.
3. Tachi, T. (2009). "Generalization of Rigid-Foldable Quadrilateral-Mesh Origami". *Journal of IASS*.
4. Hull, T.C. (2020). *Origami Design Secrets* (course materials). Western New England University.

---

**Copyright Notice**: This document summarizes mathematical principles from published research for educational purposes (fair use). No copyrighted diagrams or folding sequences are reproduced. Users should consult original sources for complete coverage.
