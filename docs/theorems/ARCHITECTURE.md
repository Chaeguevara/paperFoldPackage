# Theorem Validation Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐ │
│  │  ConfigPanel    │  │ ValidationPanel  │  │   ExportButtons    │ │
│  │  (Parameters)   │  │  (Real-time)     │  │   (Checked)        │ │
│  └────────┬────────┘  └────────┬─────────┘  └─────────┬──────────┘ │
└───────────┼────────────────────┼──────────────────────┼────────────┘
            │                    │                      │
            │ PatternConfig      │                      │
            ▼                    │                      │
┌─────────────────────────────────────────────────────────────────────┐
│                      Pattern Generation                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  generatePattern(config)                                     │  │
│  │  ├─ generateBoxPattern()      ← Uses tab/slit theorems      │  │
│  │  ├─ generatePyramidPattern()  ← Uses Kawasaki theorem       │  │
│  │  ├─ generateEnvelopePattern() ← Uses fold sequences         │  │
│  │  └─ generatePrismPattern()    ← Uses alternating locks      │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────────┘
                            │ FoldPattern
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Theorem Validation                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  validatePattern(pattern, config)                            │  │
│  │                                                               │  │
│  │  ┌────────────────────┐  ┌────────────────────────────────┐ │  │
│  │  │ Kawasaki-Justin    │  │  Assembly Mechanics            │ │  │
│  │  ├────────────────────┤  ├────────────────────────────────┤ │  │
│  │  │ • Extract vertices │  │  • validateTabDesign()         │ │  │
│  │  │ • Find connected   │  │  • validateThickness()         │ │  │
│  │  │   fold lines       │  │  • validateTabSlitPairing()    │ │  │
│  │  │ • Calculate angles │  │  • Check taper ratios          │ │  │
│  │  │ • Check sums = π   │  │  • Check depth coefficients    │ │  │
│  │  │ • Report errors    │  │  • Check min feature sizes     │ │  │
│  │  └────────────────────┘  └────────────────────────────────┘ │  │
│  │                                                               │  │
│  │  Returns: PatternValidation                                  │  │
│  │  ├─ overall: boolean                                         │  │
│  │  ├─ theorems: ValidationResult[]                             │  │
│  │  │   ├─ valid: boolean                                       │  │
│  │  │   ├─ errors: string[]                                     │  │
│  │  │   ├─ warnings: string[]                                   │  │
│  │  │   └─ details: object                                      │  │
│  │  └─ timestamp: number                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ ValidationResult
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Documentation Layer                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  docs/theorems/                                              │  │
│  │                                                               │  │
│  │  kawasaki-justin.md          assembly-mechanics.md           │  │
│  │  ┌────────────────────┐      ┌─────────────────────────┐    │  │
│  │  │ Human-Readable:    │      │ Human-Readable:         │    │  │
│  │  │ • Math formulas    │      │ • Engineering formulas  │    │  │
│  │  │ • Diagrams         │      │ • Material science      │    │  │
│  │  │ • Examples         │      │ • Load calculations     │    │  │
│  │  │                    │      │                         │    │  │
│  │  │ Machine-Readable:  │      │ Machine-Readable:       │    │  │
│  │  │ ```yaml            │      │ ```yaml                 │    │  │
│  │  │ min_folds: 4       │      │ tab_taper: 0.7          │    │  │
│  │  │ tolerance: 0.01    │      │ slit_ratio: 0.8         │    │  │
│  │  │ ```                │      │ ```                     │    │  │
│  │  └────────────────────┘      └─────────────────────────┘    │  │
│  │          ▲                              ▲                    │  │
│  │          │                              │                    │  │
│  │          └──────────┬───────────────────┘                    │  │
│  │                     │                                        │  │
│  │            Referenced by code constants                      │  │
│  │            (KAWASAKI_JUSTIN, ASSEMBLY_MECHANICS)             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: User → Pattern → Validation → Export

### 1. Configuration Phase

```
User adjusts sliders
     ↓
ConfigPanel updates PatternConfig
     ↓
{
  shapeType: 'box',
  width: 5,
  height: 3,
  depth: 5,
  thickness: 0.5
}
```

### 2. Generation Phase

```
generatePattern(config)
     ↓
generateBoxPattern(config)
     ↓
For each face:
  - Calculate vertices
  - Create fold lines (mountain/valley/cut)
  - Generate tabs with taper = 0.7
  - Generate slits with ratio = 0.8
     ↓
FoldPattern {
  name: 'Box (Glue-Free)',
  vertices: Vector3[],
  foldLines: FoldLine[],
  faces: number[][]
}
```

### 3. Validation Phase

```
validatePattern(pattern, config)
     ↓
┌─────────────────────────────────────┐
│ validateKawasakiJustin(pattern)     │
│  - Extract 24 vertices              │
│  - Check 8 interior vertices        │
│  - Validate angle sums at each      │
│  Result: ✓ Valid                    │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│ validateTabDesign(config)           │
│  - min_dim = 3cm                    │
│  - tab_depth = 3 × 0.15 = 0.45cm    │
│  - min_feature = 0.5mm × 5 = 2.5mm  │
│  - 0.45cm > 0.25cm ✓                │
│  Result: ✓ Valid                    │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│ validateThickness(config)           │
│  - 0.5mm < 10% of 3cm ✓             │
│  - min_fold_radius = 0.25mm         │
│  Result: ✓ Valid, 0 warnings        │
└─────────────────────────────────────┘
     ↓
PatternValidation {
  overall: true,
  theorems: [
    { valid: true, errors: [], warnings: [] },
    { valid: true, errors: [], warnings: [] },
    { valid: true, errors: [], warnings: [] }
  ]
}
```

### 4. Export Phase

```
if (validation.overall) {
  generatePatternSVG(config)
       ↓
  SVG with:
    - Red cut lines (tabs, slits, perimeter)
    - Blue dashed mountain folds
    - Green dashed valley folds
    - Legend
       ↓
  downloadSVG(...)
} else {
  Show errors to user
}
```

## Theorem Application Points

### Kawasaki-Justin: Applied at Vertices

```
Box pattern bottom face:

     v3 ────── v2
      │        │
      │ BOTTOM │
      │        │
     v0 ────── v1

At vertex v0:
  4 fold lines meet:
    - To v1 (bottom-right edge): mountain
    - To v3 (bottom-left edge): mountain
    - Back face fold: mountain
    - Left face fold: mountain

  Angles: [90°, 90°, 90°, 90°]
  Sum even (0,2): 90° + 90° = 180° ✓
  Sum odd (1,3): 90° + 90° = 180° ✓

  Kawasaki-Justin satisfied!
```

### Assembly Mechanics: Applied to Tabs

```
Back face tab (tucks into left face):

      backBL ────── backTL
         │ ╲          ╱ │
         │   ╲ TAB  ╱   │  ← Tab tapers to 70% width at tip
         │     ╲  ╱     │
         │      ╲╱      │
         │   (apex)     │

  Base width: edge_length
  Tip width: edge_length × 0.7
  Depth: min(w,h,d) × 0.15

  Tab fold type: MOUNTAIN (allows inward angle)

  Corresponding slit on left face:

      leftBL ────── leftTL
         │  [slit]    │  ← Slit is 80% of edge length
         │            │

  Slit length: edge_length × 0.8
  Centered: 10% uncut each end
```

## Validation Error Examples

### Kawasaki Violation

```typescript
// Hypothetical invalid vertex
const vertex = v2(0, 0);
const lines = [
  fold(v2(-1,0), v2(0,0), 'mountain'),  // 0° from +X
  fold(v2(0,0), v2(0,1), 'mountain'),   // 90° from previous
  fold(v2(0,0), v2(1,0), 'mountain'),   // 180° (opposite direction)
  fold(v2(0,0), v2(0,-1), 'mountain'),  // 270°
];

// Angles: [90°, 90°, 90°, 90°]
// Sum even: 180° ✓
// Sum odd: 180° ✓
// Actually valid! (Square vertex)

// Invalid example:
const linesInvalid = [
  fold(v2(-1,0), v2(0,0), 'mountain'),  // 0°
  fold(v2(0,0), v2(0,1), 'mountain'),   // 90°
  fold(v2(0,0), v2(0.5,0), 'mountain'), // 120° (non-perpendicular)
  fold(v2(0,0), v2(0,-1), 'mountain'),  // 270°
];

// Angles: [90°, 30°, 150°, 90°]
// Sum even: 90° + 150° = 240° ✗ (should be 180°)
// Sum odd: 30° + 90° = 120° ✗ (should be 180°)

// Validation error:
// "Even angle sum 240° ≠ π (error: 60°)"
// "Odd angle sum 120° ≠ π (error: 60°)"
```

### Assembly Mechanics Violation

```typescript
const config = {
  shapeType: 'box',
  width: 1,      // Very small box
  height: 1,
  depth: 1,
  thickness: 0.5  // Thick material
};

// Validation checks:
const minDim = 1;  // cm
const tabDepth = minDim × 0.15 = 0.15cm = 1.5mm
const minFeature = thickness × 5 = 0.5mm × 5 = 2.5mm

// 1.5mm < 2.5mm ✗

// Validation error:
// "Tab depth 1.5mm < minimum feature size 2.5mm (5× thickness)"
// "Consider: Reduce thickness OR increase dimensions"
```

## Constant Synchronization

### From Documentation → Code

```markdown
<!-- assembly-mechanics.md -->
tab_taper_ratio: 0.7
```

```typescript
// src/core/theorems.ts
export const ASSEMBLY_MECHANICS = {
  tab: {
    taperRatio: 0.7,  // Must match docs!
  }
};
```

```typescript
// src/core/geometry.ts
const taperRatio = 0.7;  // Must match theorems.ts!
```

**Synchronization Strategy**:
1. **Source of truth**: Markdown YAML blocks
2. **Code references docs**: Comments link to line numbers
3. **Tests verify sync**: (TODO) Unit tests that parse YAML and compare to code constants

### Proposed: Automated Sync

```typescript
// Future enhancement: Parse YAML from markdown at build time
import theoremData from './docs/theorems/assembly-mechanics.md?yaml';

export const ASSEMBLY_MECHANICS = theoremData.parameters;
// Ensures perfect sync between docs and code
```

## Extension Points

### Adding a New Theorem

1. **Create documentation**:
   ```
   docs/theorems/maekawa.md
   ```

2. **Define constants**:
   ```typescript
   // src/core/theorems.ts
   export const MAEKAWA = {
     id: 'maekawa',
     mountainValleyDifference: 2,
   };
   ```

3. **Implement validator**:
   ```typescript
   export function validateMaekawa(pattern: FoldPattern): ValidationResult {
     // Count mountains and valleys at each vertex
     // Check |M - V| = 2
   }
   ```

4. **Add to full validation**:
   ```typescript
   export function validatePattern(...) {
     const theoremResults = [
       validateKawasakiJustin(pattern),
       validateMaekawa(pattern),  // Add here
       validateTabDesign(config),
       // ...
     ];
   }
   ```

5. **Update README**:
   - Add theorem to list
   - Update status table

## Performance Considerations

### Validation Cost

```
For typical box pattern:
  - Vertices: ~24
  - Fold lines: ~40
  - Validation time: <1ms

Optimization not needed unless:
  - Complex patterns (>1000 vertices)
  - Real-time animation
  - Mobile devices
```

### Caching Strategy

```typescript
// Current: Revalidates on every render
const validation = useMemo(() => {
  const pattern = generatePattern(config);
  return validatePattern(pattern, config);
}, [config]);  // Memoized by config object

// If performance issues:
// 1. Debounce validation (wait 200ms after last change)
// 2. Web Worker for validation
// 3. Incremental validation (only changed vertices)
```

## Testing Strategy

### Unit Tests

```typescript
describe('Kawasaki-Justin Validation', () => {
  it('should pass for valid box vertex', () => {
    const vertex = v2(0, 0);
    const lines = [
      // 4 perpendicular folds
    ];
    const result = verifyKawasakiJustinAtVertex(vertex, lines);
    expect(result.valid).toBe(true);
  });

  it('should fail for invalid angle sums', () => {
    // Construct deliberately invalid vertex
    const result = verifyKawasakiJustinAtVertex(...);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('Pattern Validation', () => {
  it('should validate standard box as valid', () => {
    const config = { shapeType: 'box', width: 5, height: 3, depth: 5, thickness: 0.5 };
    const pattern = generatePattern(config);
    const validation = validatePattern(pattern, config);

    expect(validation.overall).toBe(true);
  });

  it('should reject overly thick material', () => {
    const config = { shapeType: 'box', width: 1, height: 1, depth: 1, thickness: 2 };
    const validation = validatePattern(generatePattern(config), config);

    expect(validation.overall).toBe(false);
    // Should have thickness-related error
  });
});
```

## Diagram: Theorem Application Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User changes width from 5cm to 10cm                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  generatePattern({ ...config, width: 10 })                   │
│                                                               │
│  Tab depth recalculated:                                     │
│    OLD: min(5,3,5) × 0.15 = 0.45cm                          │
│    NEW: min(10,3,5) × 0.15 = 0.45cm  (still limited by 3cm) │
│                                                               │
│  Pattern vertices shifted for new dimensions                 │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  validatePattern(newPattern, newConfig)                      │
│                                                               │
│  Kawasaki: Re-check all 24 vertices                          │
│    → Geometry changed, angles might be different             │
│    → Result: Still valid (perpendicular folds maintained)    │
│                                                               │
│  Tab design: Re-check depth                                  │
│    → Tab depth still 0.45cm (min dimension didn't change)    │
│    → Result: Still valid                                     │
│                                                               │
│  Thickness: Re-check relative to new dimensions              │
│    → 0.5mm vs min(10,3,5)cm = 3cm                           │
│    → 0.5mm < 3mm (10% limit) ✓                              │
│    → Result: Still valid                                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  UI updates:                                                  │
│  - 3D preview shows new dimensions                           │
│  - ValidationPanel shows ✓ all green                         │
│  - Export button enabled                                     │
└──────────────────────────────────────────────────────────────┘
```

This architecture ensures that both **human understanding** (via documentation) and **machine enforcement** (via validation code) stay in sync, grounded in mathematical theorems and engineering principles.
