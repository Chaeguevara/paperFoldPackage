---
name: export-svg
description: Export Three.js 3D scenes to SVG format. Use when implementing SVG export, converting 3D to 2D vector graphics, or when user mentions SVG, vector export, or cut files.
---

# SVG Export from Three.js

## Quick Reference

| Approach | Best For | Complexity |
|----------|----------|------------|
| SVGRenderer | Simple scenes, quick export | Low |
| Custom Projection | Full control, paper fold patterns | Medium |
| three-to-svg | Feature-rich, styled output | Low |

## Paper Folding SVG Layers

| Layer | Stroke Style | Color Convention |
|-------|--------------|------------------|
| Cut lines | Solid | Red (#FF0000) |
| Mountain folds | Dashed (8,4) | Blue (#0000FF) |
| Valley folds | Dashed (4,2) | Green (#00FF00) |
| Score lines | Dotted | Gray (#888888) |

## Files in This Skill

- **[reference.md](./reference.md)** - SVGRenderer API, projection math, SVG structure
- **[examples.md](./examples.md)** - Complete implementation examples
- **[scripts/svg-exporter.ts](./scripts/svg-exporter.ts)** - Ready-to-use export utility

## Quick Start

```typescript
import { exportToSVG } from './scripts/svg-exporter';
const svg = exportToSVG(scene, camera, { layers: true });
downloadBlob(svg, 'pattern.svg');
```
