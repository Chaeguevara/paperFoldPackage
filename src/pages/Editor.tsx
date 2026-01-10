import { useState, useCallback } from 'react';
import { Scene } from '@/core/Scene';
import { ConfigPanel, ExportButtons } from '@/ui';
import { downloadSVG } from '@/export';
import type { PatternConfig } from '@/types';

const defaultConfig: PatternConfig = {
  shapeType: 'box',
  width: 5,
  height: 3,
  depth: 5,
  thickness: 0.5,
};

export function Editor() {
  const [config, setConfig] = useState<PatternConfig>(defaultConfig);

  const handleExportSVG = useCallback(() => {
    // Simple 2D projection for SVG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <style>
      .cut { stroke: #FF0000; stroke-width: 1; fill: none; }
      .mountain { stroke: #0000FF; stroke-width: 0.5; stroke-dasharray: 8,4; fill: none; }
      .valley { stroke: #00FF00; stroke-width: 0.5; stroke-dasharray: 4,2; fill: none; }
    </style>
  </defs>
  <g transform="translate(200, 150)">
    <!-- Simplified box pattern -->
    <rect x="${-config.width * 20}" y="${-config.height * 20}"
          width="${config.width * 40}" height="${config.height * 40}"
          class="cut"/>
    <line x1="${-config.width * 20}" y1="0"
          x2="${config.width * 20}" y2="0"
          class="mountain"/>
  </g>
</svg>`;

    downloadSVG(svgContent, `pattern-${config.width}x${config.height}x${config.depth}`);
  }, [config]);

  const handleExportSTL = useCallback(() => {
    // STL export would use Three.js scene
    alert('STL export - requires Three.js scene reference. See export/stl.ts');
  }, []);

  return (
    <div className="editor">
      <div className="editor-sidebar">
        <ConfigPanel config={config} onChange={setConfig} />
        <ExportButtons onExportSVG={handleExportSVG} onExportSTL={handleExportSTL} />
      </div>

      <div className="editor-canvas">
        <Scene config={config} showFoldLines />
      </div>
    </div>
  );
}
