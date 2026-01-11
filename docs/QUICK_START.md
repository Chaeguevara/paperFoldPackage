# Quick Start: Theorem Validation System

## What We Built

A theorem-based validation system that ensures paper fold patterns support **glue-free mechanical assembly**.

## Files Created

### Documentation (Human-Readable)
- `docs/theorems/README.md` - System overview
- `docs/theorems/kawasaki-justin.md` - Flat-foldability theorem
- `docs/theorems/assembly-mechanics.md` - Engineering constraints for tabs/slits
- `docs/theorems/ARCHITECTURE.md` - System architecture diagrams
- `docs/IMPLEMENTATION_SUMMARY.md` - Complete implementation details

### Code (Machine-Readable)
- `src/core/theorems.ts` - Validation functions and constants
- `src/ui/ValidationPanel.tsx` - Real-time validation UI component

### Modified Files
- `src/pages/Templates.tsx` - Exported templates array
- `src/pages/Editor.tsx` - Added URL parameter handling for templates
- `src/ui/ConfigPanel.tsx` - Conditionally hide shape selector
- `src/ui/index.ts` - Export ValidationPanel

## Key Features

### 1. Template Click Behavior ✅
Click template → loads config, hides shape selector, shows only parameters

### 2. Theorem Documentation ✅
- **Kawasaki-Justin**: Alternating angles at vertices = 180°
- **Assembly Mechanics**: Tab taper (0.7), depth coefficients, slit ratios (0.8)

### 3. Runtime Validation ✅
```typescript
import { validatePattern } from '@/core/theorems';

const validation = validatePattern(pattern, config);
console.log(validation.overall); // true/false
```

## Usage

### Option 1: Add Validation Panel to UI
```tsx
// src/pages/Editor.tsx
import { ValidationPanel } from '@/ui';

<ValidationPanel config={config} />
```

### Option 2: Validate Before Export
```typescript
const handleExportSVG = useCallback(() => {
  const pattern = generatePattern(config);
  const validation = validatePattern(pattern, config);

  if (!validation.overall) {
    alert('Pattern violates theorems!');
    return;
  }

  // Export...
}, [config]);
```

## Understanding the Cuts

**Q: What are the cuts in 전개도 for?**

Three types:
1. **Perimeter cuts** - Outer edges (cut from sheet)
2. **Tab cuts** - Trapezoidal tabs that tuck into slits
3. **Insertion slits** - Small cuts where tabs lock in

**All assembly is glue-free** - mechanical locking only!

## Next Steps

1. Read `docs/theorems/README.md` for full explanation
2. Review `docs/IMPLEMENTATION_SUMMARY.md` for limitations
3. Test validation in dev environment
4. Decide which enhancements to prioritize

## Questions?

See `docs/IMPLEMENTATION_SUMMARY.md` section "Questions Answered" for detailed explanations.
