# SVG Export Reference

## Three.js SVGRenderer

```typescript
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';

const renderer = new SVGRenderer();
renderer.setSize(width, height);
renderer.setQuality('high'); // 'low' | 'high'
renderer.render(scene, camera);

// Access SVG DOM element
const svgElement: SVGSVGElement = renderer.domElement;
const svgString = new XMLSerializer().serializeToString(svgElement);
```

### SVGRenderer Limitations
- No texture support
- No shader materials
- Limited to edge rendering
- No gradient fills

## Custom 3D to 2D Projection

### Projection Math

```typescript
function projectVertex(
  vertex: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const projected = vertex.clone().project(camera);
  return {
    x: (projected.x + 1) * width / 2,
    y: (-projected.y + 1) * height / 2
  };
}
```

### Depth Sorting for Overlapping Faces

```typescript
function sortFacesByDepth(faces: Face[], camera: THREE.Camera): Face[] {
  return faces.sort((a, b) => {
    const centerA = a.centroid.clone().project(camera);
    const centerB = b.centroid.clone().project(camera);
    return centerB.z - centerA.z; // Far to near
  });
}
```

## SVG Structure for Paper Folds

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <style>
      .cut { stroke: #FF0000; stroke-width: 1; fill: none; }
      .mountain { stroke: #0000FF; stroke-width: 0.5; stroke-dasharray: 8,4; fill: none; }
      .valley { stroke: #00FF00; stroke-width: 0.5; stroke-dasharray: 4,2; fill: none; }
    </style>
  </defs>

  <g id="cut-lines" class="cut">
    <!-- Outer boundary paths -->
  </g>

  <g id="mountain-folds" class="mountain">
    <!-- Mountain fold paths -->
  </g>

  <g id="valley-folds" class="valley">
    <!-- Valley fold paths -->
  </g>

  <g id="annotations">
    <!-- Dimensions, labels -->
  </g>
</svg>
```

## Path Optimization

### Douglas-Peucker Simplification

```typescript
function simplifyPath(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPath(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [start, end];
}
```

### Merge Coincident Paths

```typescript
function mergeCoincidentPaths(paths: Path[], tolerance = 0.001): Path[] {
  // Group paths by start/end points within tolerance
  // Merge connected segments into continuous paths
  // Return optimized path set
}
```

## File Download

```typescript
function downloadSVG(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
```
