# STL Export Reference

## Three.js STLExporter API

```typescript
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

const exporter = new STLExporter();

// ASCII format (string)
const asciiResult: string = exporter.parse(mesh);

// Binary format (ArrayBuffer)
const binaryResult: ArrayBuffer = exporter.parse(mesh, { binary: true });
```

### Export Options

```typescript
interface STLExporterOptions {
  binary?: boolean;  // Default: false (ASCII)
}
```

## Geometry Validation

### Check Manifold (Watertight)

Non-manifold geometry causes slicing errors.

```typescript
function isManifold(geometry: THREE.BufferGeometry): boolean {
  const edges = new Map<string, number>();
  const positions = geometry.attributes.position;
  const index = geometry.index;

  if (!index) return false;

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    countEdge(edges, a, b);
    countEdge(edges, b, c);
    countEdge(edges, c, a);
  }

  // Every edge should appear exactly twice (shared by 2 faces)
  for (const count of edges.values()) {
    if (count !== 2) return false;
  }
  return true;
}

function countEdge(edges: Map<string, number>, a: number, b: number) {
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  edges.set(key, (edges.get(key) || 0) + 1);
}
```

### Verify Normals

```typescript
function hasConsistentNormals(geometry: THREE.BufferGeometry): boolean {
  geometry.computeVertexNormals();

  const normals = geometry.attributes.normal;
  const positions = geometry.attributes.position;

  // Check if normals point outward (simplified check)
  // For convex shapes, normals should point away from centroid

  return true; // Implement full check as needed
}

// Fix normals
geometry.computeVertexNormals();
```

### Check Wall Thickness

```typescript
function estimateMinWallThickness(geometry: THREE.BufferGeometry): number {
  // Raycast from surface points inward
  // Return minimum distance to opposite surface
  // This is computationally expensive for complex models
}
```

## Units and Scale

STL files have no unit specification. Convention:

| Software | Default Unit |
|----------|--------------|
| Most slicers | millimeters |
| Fusion 360 | millimeters |
| Blender | meters (scale 0.001) |

```typescript
function scaleForPrint(mesh: THREE.Mesh, targetUnit: 'mm' | 'cm' | 'inch') {
  const scales = { mm: 1, cm: 10, inch: 25.4 };
  mesh.scale.multiplyScalar(scales[targetUnit]);
  mesh.updateMatrixWorld();
}
```

## Merging Multiple Meshes

```typescript
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function mergeSceneForExport(scene: THREE.Scene): THREE.Mesh {
  const geometries: THREE.BufferGeometry[] = [];

  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const geo = obj.geometry.clone();
      obj.updateMatrixWorld();
      geo.applyMatrix4(obj.matrixWorld);
      geometries.push(geo);
    }
  });

  const merged = BufferGeometryUtils.mergeGeometries(geometries);
  return new THREE.Mesh(merged);
}
```

## Common Print Settings Reference

| Parameter | FDM | SLA/Resin |
|-----------|-----|-----------|
| Min wall | 1.2mm (2 walls) | 0.5mm |
| Min detail | 0.4mm | 0.05mm |
| Overhangs | < 45° | Any (supports) |
| Bridge | < 10mm | N/A |

## Paper Fold to Printable Hinge

Converting fold patterns to printed living hinges:

```typescript
interface LivingHinge {
  width: number;      // Hinge line width
  thickness: number;  // Reduced thickness at hinge
  pattern: 'straight' | 'serpentine' | 'lattice';
}

// Typical values for flexible hinges
const defaultHinge: LivingHinge = {
  width: 2,           // 2mm wide
  thickness: 0.4,     // 0.4mm at thinnest (1 layer)
  pattern: 'serpentine'
};
```
