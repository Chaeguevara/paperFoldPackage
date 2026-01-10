# SVG Export Examples

## Basic SVGRenderer Export

```typescript
import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';

function exportSceneToSVG(
  scene: THREE.Scene,
  camera: THREE.Camera,
  width = 800,
  height = 600
): string {
  const renderer = new SVGRenderer();
  renderer.setSize(width, height);
  renderer.render(scene, camera);

  return new XMLSerializer().serializeToString(renderer.domElement);
}

// Usage
const svgString = exportSceneToSVG(scene, camera);
downloadSVG(svgString, 'export.svg');
```

## Paper Fold Pattern with Layers

```typescript
interface FoldPattern {
  cutLines: THREE.Line[];
  mountainFolds: THREE.Line[];
  valleyFolds: THREE.Line[];
}

function exportFoldPattern(
  pattern: FoldPattern,
  camera: THREE.Camera,
  options: { width: number; height: number }
): string {
  const { width, height } = options;

  const projectLine = (line: THREE.Line): string => {
    const positions = line.geometry.attributes.position;
    const points: string[] = [];

    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      const projected = vertex.project(camera);
      const x = (projected.x + 1) * width / 2;
      const y = (-projected.y + 1) * height / 2;
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }

    return points.join(' ');
  };

  const cutPaths = pattern.cutLines.map(l =>
    `<path d="${projectLine(l)}" class="cut"/>`
  ).join('\n    ');

  const mountainPaths = pattern.mountainFolds.map(l =>
    `<path d="${projectLine(l)}" class="mountain"/>`
  ).join('\n    ');

  const valleyPaths = pattern.valleyFolds.map(l =>
    `<path d="${projectLine(l)}" class="valley"/>`
  ).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .cut { stroke: #FF0000; stroke-width: 1; fill: none; }
      .mountain { stroke: #0000FF; stroke-width: 0.5; stroke-dasharray: 8,4; fill: none; }
      .valley { stroke: #00FF00; stroke-width: 0.5; stroke-dasharray: 4,2; fill: none; }
    </style>
  </defs>

  <g id="cut-lines">
    ${cutPaths}
  </g>

  <g id="mountain-folds">
    ${mountainPaths}
  </g>

  <g id="valley-folds">
    ${valleyPaths}
  </g>
</svg>`;
}
```

## React Component for SVG Export

```tsx
import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';

interface ExportButtonProps {
  filename?: string;
}

export function SVGExportButton({ filename = 'pattern' }: ExportButtonProps) {
  const { scene, camera, size } = useThree();

  const handleExport = useCallback(() => {
    const svg = exportSceneToSVG(scene, camera, size.width, size.height);
    downloadSVG(svg, `${filename}.svg`);
  }, [scene, camera, size, filename]);

  return (
    <button onClick={handleExport}>
      Export SVG
    </button>
  );
}
```

## Adding Dimensions and Labels

```typescript
function addDimensionLine(
  svg: SVGElement,
  start: { x: number; y: number },
  end: { x: number; y: number },
  label: string
): void {
  const ns = 'http://www.w3.org/2000/svg';

  // Dimension line
  const line = document.createElementNS(ns, 'line');
  line.setAttribute('x1', String(start.x));
  line.setAttribute('y1', String(start.y));
  line.setAttribute('x2', String(end.x));
  line.setAttribute('y2', String(end.y));
  line.setAttribute('stroke', '#333');
  line.setAttribute('stroke-width', '0.5');

  // Label
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', String((start.x + end.x) / 2));
  text.setAttribute('y', String((start.y + end.y) / 2 - 5));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '10');
  text.textContent = label;

  svg.appendChild(line);
  svg.appendChild(text);
}
```
