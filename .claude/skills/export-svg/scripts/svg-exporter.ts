/**
 * SVG Exporter Utility for Three.js Paper Fold Patterns
 * Execute this script or import functions as needed
 */

import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';

export interface SVGExportOptions {
  width?: number;
  height?: number;
  layers?: boolean;
  includeBackground?: boolean;
  strokeWidth?: number;
}

export interface FoldPatternData {
  cutLines: THREE.Vector3[][];
  mountainFolds: THREE.Vector3[][];
  valleyFolds: THREE.Vector3[][];
}

const DEFAULT_OPTIONS: Required<SVGExportOptions> = {
  width: 800,
  height: 600,
  layers: true,
  includeBackground: false,
  strokeWidth: 1,
};

/**
 * Export Three.js scene to SVG string
 */
export function exportToSVG(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: SVGExportOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const renderer = new SVGRenderer();
  renderer.setSize(opts.width, opts.height);
  renderer.render(scene, camera);
  return new XMLSerializer().serializeToString(renderer.domElement);
}

/**
 * Export fold pattern with separate layers
 */
export function exportFoldPatternToSVG(
  pattern: FoldPatternData,
  camera: THREE.Camera,
  options: SVGExportOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height } = opts;

  const projectPath = (points: THREE.Vector3[]): string => {
    return points.map((p, i) => {
      const projected = p.clone().project(camera);
      const x = ((projected.x + 1) * width) / 2;
      const y = ((-projected.y + 1) * height) / 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  };

  const cutPaths = pattern.cutLines
    .map(line => `<path d="${projectPath(line)}" class="cut"/>`)
    .join('\n      ');

  const mountainPaths = pattern.mountainFolds
    .map(line => `<path d="${projectPath(line)}" class="mountain"/>`)
    .join('\n      ');

  const valleyPaths = pattern.valleyFolds
    .map(line => `<path d="${projectPath(line)}" class="valley"/>`)
    .join('\n      ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .cut { stroke: #FF0000; stroke-width: ${opts.strokeWidth}; fill: none; }
      .mountain { stroke: #0000FF; stroke-width: ${opts.strokeWidth * 0.5}; stroke-dasharray: 8,4; fill: none; }
      .valley { stroke: #00FF00; stroke-width: ${opts.strokeWidth * 0.5}; stroke-dasharray: 4,2; fill: none; }
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
