import * as THREE from 'three';
import type { FoldPattern, SVGExportOptions } from '@/types';

const DEFAULT_OPTIONS: SVGExportOptions = {
  width: 800,
  height: 600,
  includeLayers: true,
  strokeWidth: 1,
};

/**
 * Project 3D point to 2D SVG coordinates
 */
function projectToSVG(
  point: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const projected = point.clone().project(camera);
  return {
    x: ((projected.x + 1) * width) / 2,
    y: ((-projected.y + 1) * height) / 2,
  };
}

/**
 * Export fold pattern to SVG string
 */
export function exportPatternToSVG(
  pattern: FoldPattern,
  camera: THREE.Camera,
  options: Partial<SVGExportOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, strokeWidth } = opts;

  const cutLines: string[] = [];
  const mountainFolds: string[] = [];
  const valleyFolds: string[] = [];

  pattern.foldLines.forEach((line) => {
    const start = projectToSVG(line.start, camera, width, height);
    const end = projectToSVG(line.end, camera, width, height);
    const d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;

    switch (line.type) {
      case 'cut':
        cutLines.push(`<path d="${d}" class="cut"/>`);
        break;
      case 'mountain':
        mountainFolds.push(`<path d="${d}" class="mountain"/>`);
        break;
      case 'valley':
        valleyFolds.push(`<path d="${d}" class="valley"/>`);
        break;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      .cut { stroke: #FF0000; stroke-width: ${strokeWidth}; fill: none; }
      .mountain { stroke: #0000FF; stroke-width: ${strokeWidth * 0.5}; stroke-dasharray: 8,4; fill: none; }
      .valley { stroke: #00FF00; stroke-width: ${strokeWidth * 0.5}; stroke-dasharray: 4,2; fill: none; }
    </style>
  </defs>

  <g id="cut-lines">
    ${cutLines.join('\n    ')}
  </g>

  <g id="mountain-folds">
    ${mountainFolds.join('\n    ')}
  </g>

  <g id="valley-folds">
    ${valleyFolds.join('\n    ')}
  </g>
</svg>`;
}

/**
 * Download SVG content as file
 */
export function downloadSVG(content: string, filename: string): void {
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
