# Assembly Mechanics for Glue-Free Packaging

## Overview

Engineering principles for mechanical interlocking in paper packaging without adhesives. Unlike traditional origami theorems, these are derived from material science and structural engineering.

---
id: assembly-mechanics
category: structural-engineering
priority: critical
applies_to: [tabs, slits, friction_fit, material_thickness]
implementation: src/core/geometry.ts:generateLockingTab, generateSlit
---

## Core Principle

**Glue-free assembly relies on mechanical interference fit**: tabs must create sufficient friction and geometric locking to maintain structural integrity under normal use.

## Tab Design Constraints

### 1. Taper Ratio Theorem

**Definition**: For reliable insertion without tearing, tabs must narrow toward the tip.

```yaml
constraint:
  taper_ratio: 0.7  # Tip width = 70% of base width
  formula: tip_width = base_width × taper_ratio

geometry:
  shape: trapezoidal
  inset_per_side: (1 - taper_ratio) / 2

material_basis:
  - Prevents buckling during insertion
  - Reduces insertion force by ~40%
  - Maintains hold strength due to base width
```

**Implementation**: [geometry.ts:54-56](../src/core/geometry.ts#L54-L56)

```typescript
const taperRatio = 0.7;
const insetRatio = (1 - taperRatio) / 2;
```

### 2. Tab Depth Formula

**Definition**: Tab depth must scale with the smallest box dimension to prevent tearing.

```
tab_depth = min(width, height, depth) × 0.12–0.15
```

**Rationale**:
- Too shallow (<0.10): Insufficient hold, tabs pull out
- Too deep (>0.20): Difficult insertion, paper tears at base fold
- Optimal (0.12–0.15): Balance between hold strength and ease of assembly

**Variables**:
- `k_tab = 0.15` for boxes [geometry.ts:122](../src/core/geometry.ts#L122)
- `k_tab = 0.12` for pyramids [geometry.ts:289](../src/core/geometry.ts#L289)

**Why the difference?**
- Pyramids have angled faces → more stress at tab base → reduce depth
- Boxes have perpendicular faces → less stress → can use deeper tabs

### 3. Fold Type at Tab Base

**Rule**: Tabs MUST attach via **mountain folds** (fold away from viewer on flat pattern).

```yaml
reason:
  assembly_direction: Tabs push inward into structure
  fold_opens: Mountain fold allows tab to angle inward
  valley_fails: Would force tab to angle outward (no insertion possible)

implementation:
  - All tab bases use type: 'mountain'
  - See geometry.ts:74
```

**Critical**: This is not arbitrary—the fold type determines whether the tab can physically enter the slit.

## Slit Design Constraints

### 4. Slit Length Ratio

**Definition**: Slits must be shorter than the edge they're on to maintain structural integrity.

```
slit_length = edge_length × slit_ratio
slit_ratio = 0.7–0.8
```

**Implementation**: [geometry.ts:90](../src/core/geometry.ts#L90)

```typescript
function generateSlit(
  start: THREE.Vector3,
  end: THREE.Vector3,
  slitRatio: number = 0.8
)
```

**Edge Retention**:
```
┌────────────────┐
│  [   slit   ]  │  ← 20% uncut edges hold structure
│                │
└────────────────┘
  10%        10%
  retained   retained
```

### 5. Slit Placement Theorem

**Rule**: Slits must be centered on edges, not at corners.

```yaml
constraint:
  center_offset: 0.5
  edge_inset: (1 - slit_ratio) / 2

failure_modes:
  corner_slit: Paper tears from corner along grain
  off_center: Asymmetric stress causes tilt/misalignment
```

**Implementation**: [geometry.ts:96-98](../src/core/geometry.ts#L96-L98)

## Tab-Slit Pairing

### 6. Alternating Lock Pattern

**Theorem**: Adjacent edges cannot both have tabs OR both have slits.

```yaml
pattern:
  edge_1: tab
  edge_2: slit   ← receives edge_1's tab
  edge_3: tab    ← goes into edge_4's slit
  edge_4: slit

reason:
  - Prevents interference (tab can't go into tab)
  - Ensures full assembly (every tab has a destination)
  - Distributes stress evenly around structure
```

**Box Example**: [geometry.ts:235-252](../src/core/geometry.ts#L235-L252)
- Back face left/right edges: tabs
- Left/right face edges: slits
- Top face left/right: tabs

**Pyramid Example**: [geometry.ts:352-365](../src/core/geometry.ts#L352-L365)
- Front-left, back-right, left-back, right-front: tabs (alternating around perimeter)

### 7. Interference Fit Calculation

**Definition**: Tab width must slightly exceed slit width for friction hold.

```
interference = tab_base_width - slit_width
optimal_interference = material_thickness × (0.05–0.1)
```

**Current Implementation**: Implicit (tabs and slits use same edge length)

**Future Enhancement**: Add explicit interference calculation based on material thickness.

```typescript
// Proposed improvement
const slitWidth = edgeLength - (config.thickness * 0.1);
```

## Material Thickness Constraints

### 8. Minimum Fold Radius

**Engineering Limit**: Paper cannot fold sharper than its thickness allows.

```yaml
min_fold_radius: material_thickness / 2

implications:
  thick_paper:
    - Larger minimum radius
    - Gentler tab tapers needed
    - Wider slit clearances

  thin_paper:
    - Sharper folds possible
    - Tighter tolerances achievable
    - Risk of tearing at stress points
```

**Current Status**: Not yet implemented (thickness parameter exists but not used in calculations)

**TODO**: Add thickness-based validation:
```typescript
function validateThickness(config: PatternConfig): boolean {
  const minFeatureSize = config.thickness * 5; // Empirical rule
  return config.tabDepth >= minFeatureSize;
}
```

### 9. Grain Direction (Paper Anisotropy)

**Critical Manufacturing Detail**: Paper has grain direction affecting fold and tear behavior.

```yaml
grain_parallel:
  fold_quality: excellent
  tear_resistance: low

grain_perpendicular:
  fold_quality: fair (slight cracking)
  tear_resistance: high

optimal_layout:
  - Main folds parallel to grain
  - Tab folds perpendicular to grain (better tear resistance)
```

**Current Status**: Not implemented (future enhancement for DXF/cut file generation)

## Assembly Sequence Constraints

### 10. Closure Order Theorem

**Rule**: Last closure must be mechanically possible given already-locked tabs.

**Envelope Example**: [geometry.ts:389-484](../src/core/geometry.ts#L389-L484)
```
1. Bottom flap folds up
2. Side flaps fold in (overlap bottom)
3. Top flap folds down and TUCKS under side flaps
```

**Box Example**:
```
1. Fold up all four sides (bottom face becomes interior)
2. Insert back face tabs into left/right face slits
3. Fold top face down
4. Insert top face tabs (must be accessible even with sides locked)
```

**Validation**: Each tab insertion must not require disassembly of previously locked tabs.

## Structural Integrity

### 11. Load Distribution

**Principle**: Tabs should distribute loads to multiple edges, not single points.

```yaml
bad_design:
  all_tabs_one_side: true
  result: Asymmetric stress, twisting, failure

good_design:
  tabs_distributed: alternating_pattern
  result: Balanced load, stable structure
```

### 12. Stress Concentration Avoidance

**Rule**: No cuts or slits at fold line intersections.

```
     ×  ← BAD: slit intersects fold
     |
─────┼─────  ← fold line
     |
     ×


  [  ]  ← GOOD: slit offset from fold
     |
─────┼─────
     |
```

**Implementation**: Slits are always on flat faces, never on fold lines.

## Testing Criteria

### Physical Assembly Test

A valid glue-free pattern must satisfy:

```yaml
insertion_test:
  - All tabs insert without tearing (max force < 2N)
  - No buckling during insertion
  - Audible/tactile "click" when locked

hold_test:
  - Structure maintains shape when inverted
  - No tab pull-out under 0.5kg load
  - No creep/loosening after 24 hours

disassembly_test:
  - Can be disassembled without tearing
  - Reassembles successfully (reusable)
```

## Machine-Readable Summary

```yaml
theorem:
  id: assembly-mechanics
  name: Glue-Free Assembly Constraints
  type: structural-engineering

parameters:
  tab_taper_ratio:
    value: 0.7
    range: [0.65, 0.75]
    unit: dimensionless

  tab_depth_coefficient:
    box: 0.15
    pyramid: 0.12
    prism: 0.15
    envelope: 0.10
    unit: fraction_of_min_dimension

  slit_length_ratio:
    value: 0.8
    range: [0.7, 0.85]
    unit: fraction_of_edge

  interference_fit:
    value: 0.05
    range: [0.05, 0.1]
    unit: multiple_of_thickness

validation:
  functions:
    - generateLockingTab
    - generateSlit
    - validateTabSlitPairing

  checks:
    - alternating_pattern
    - no_corner_slits
    - accessible_closure_order

failure_modes:
  tab_tear: tab_depth > 0.2 × min_dimension
  slit_tear: slit_ratio > 0.9
  pull_out: tab_depth < 0.08 × min_dimension
  buckling: taper_ratio < 0.6

constraints_violated_in_current_code:
  - Interference fit not explicitly calculated
  - Material thickness not used in tab/slit sizing
  - No grain direction optimization
  - No closure order validation
```

## Future Enhancements

1. **Thickness-aware calculations**: Scale tab/slit sizes based on material thickness
2. **Grain direction optimizer**: Rotate pattern for optimal fold/tear behavior
3. **Assembly sequence validator**: Check that closure order is physically possible
4. **Load testing simulation**: FEA-lite stress analysis at vertices
5. **Multi-material support**: Different constraints for cardstock vs paperboard vs corrugated

## References

- Nordstrand, T. (2003). "Basic Testing and Strength Design of Corrugated Board and Containers"
- Maltenfort, G. (1988). "Corrugated Shipping Containers: An Engineering Approach"
- Traditional Japanese hakosashi box construction methods
- Engineering tolerances from ISO 2768 (general tolerances for paper products)
