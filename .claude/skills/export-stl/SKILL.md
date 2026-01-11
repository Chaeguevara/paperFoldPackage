---
name: export-stl
description: Export Three.js meshes to STL format for 3D printing. Use when implementing STL export, 3D printing preparation, or when user mentions STL, 3D print, or additive manufacturing.
---

# STL Export from Three.js

## Quick Reference

| Format | File Size | Use Case |
|--------|-----------|----------|
| Binary STL | Smaller (~5x) | Production, slicers |
| ASCII STL | Larger | Debugging, manual editing |

## 3D Print Checklist

| Check | Why |
|-------|-----|
| Manifold geometry | No holes for slicers |
| Correct normals | Surface direction |
| Min wall thickness | 1mm FDM, 0.5mm SLA |
| Scale (mm) | STL is unitless |

## Files in This Skill

- **[reference.md](./reference.md)** - STLExporter API, geometry validation, print settings
- **[examples.md](./examples.md)** - Complete export implementations
- **[scripts/stl-exporter.ts](./scripts/stl-exporter.ts)** - Ready-to-use export with validation

## Quick Start

```typescript
import { exportToSTL, validateForPrint } from './scripts/stl-exporter';

const issues = validateForPrint(mesh);
if (issues.length === 0) {
  exportToSTL(mesh, 'model.stl', { binary: true });
}
```
