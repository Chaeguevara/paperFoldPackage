import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DualScene } from '@/core/Scene';
import { ConfigPanel, ExportButtons } from '@/ui';
import { downloadSVG } from '@/export';
import { generatePattern } from '@/core/geometry';
import type { PatternConfig } from '@/types';
import { templates } from './Templates';

const defaultConfig: PatternConfig = {
  shapeType: 'box',
  width: 5,
  height: 3,
  depth: 5,
  thickness: 0.5,
};

/**
 * Generate SVG content from the fold pattern
 * Creates a proper 전개도 (unfolding pattern) with cut and fold lines
 */
function generatePatternSVG(config: PatternConfig): string {
  const pattern = generatePattern(config);
  const { foldLines } = pattern;

  // Calculate bounding box
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  foldLines.forEach(line => {
    minX = Math.min(minX, line.start.x, line.end.x);
    maxX = Math.max(maxX, line.start.x, line.end.x);
    minZ = Math.min(minZ, line.start.z, line.end.z);
    maxZ = Math.max(maxZ, line.start.z, line.end.z);
  });

  // Add padding
  const padding = 2;
  minX -= padding;
  minZ -= padding;
  maxX += padding;
  maxZ += padding;

  const width = maxX - minX;
  const height = maxZ - minZ;

  // Scale to reasonable SVG size (in cm for printing)
  const scale = 10; // 10 pixels per cm
  const svgWidth = width * scale;
  const svgHeight = height * scale;

  // Group lines by type
  const cutLines = foldLines.filter(l => l.type === 'cut');
  const mountainLines = foldLines.filter(l => l.type === 'mountain');
  const valleyLines = foldLines.filter(l => l.type === 'valley');

  // Generate SVG paths
  const toSVGPath = (line: typeof foldLines[0]) => {
    const x1 = (line.start.x - minX) * scale;
    const y1 = (line.start.z - minZ) * scale;
    const x2 = (line.end.x - minX) * scale;
    const y2 = (line.end.z - minZ) * scale;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  const cutPaths = cutLines.map(l => `<path d="${toSVGPath(l)}" class="cut"/>`).join('\n    ');
  const mountainPaths = mountainLines.map(l => `<path d="${toSVGPath(l)}" class="mountain"/>`).join('\n    ');
  const valleyPaths = valleyLines.map(l => `<path d="${toSVGPath(l)}" class="valley"/>`).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${svgWidth.toFixed(2)} ${svgHeight.toFixed(2)}"
     width="${svgWidth.toFixed(2)}mm"
     height="${svgHeight.toFixed(2)}mm">
  <defs>
    <style>
      /* Cut lines - solid red, use for laser cutter or scissors */
      .cut { stroke: #FF0000; stroke-width: 0.5; fill: none; stroke-linecap: round; }
      /* Mountain folds - dashed blue, fold AWAY from you */
      .mountain { stroke: #0000FF; stroke-width: 0.3; stroke-dasharray: 3,1.5; fill: none; stroke-linecap: round; }
      /* Valley folds - dashed green, fold TOWARD you */
      .valley { stroke: #00FF00; stroke-width: 0.3; stroke-dasharray: 1.5,0.75; fill: none; stroke-linecap: round; }
    </style>
  </defs>

  <!-- Pattern: ${pattern.name} -->
  <!-- Dimensions: ${config.width}cm x ${config.height}cm x ${config.depth}cm -->
  <!-- Glue-Free Assembly: Cut on red lines, fold on blue/green lines -->

  <g id="cut-lines">
    ${cutPaths}
  </g>

  <g id="mountain-folds">
    ${mountainPaths}
  </g>

  <g id="valley-folds">
    ${valleyPaths}
  </g>

  <!-- Legend -->
  <g transform="translate(10, ${svgHeight - 30})">
    <text x="0" y="0" font-size="8" fill="#333">Legend:</text>
    <line x1="0" y1="8" x2="20" y2="8" stroke="#FF0000" stroke-width="0.5"/>
    <text x="25" y="11" font-size="6" fill="#333">Cut</text>
    <line x1="50" y1="8" x2="70" y2="8" stroke="#0000FF" stroke-width="0.3" stroke-dasharray="3,1.5"/>
    <text x="75" y="11" font-size="6" fill="#333">Mountain (away)</text>
    <line x1="130" y1="8" x2="150" y2="8" stroke="#00FF00" stroke-width="0.3" stroke-dasharray="1.5,0.75"/>
    <text x="155" y="11" font-size="6" fill="#333">Valley (toward)</text>
  </g>
</svg>`;
}

export function Editor() {
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<PatternConfig>(defaultConfig);
  const [isTemplate, setIsTemplate] = useState(false);

  // Load template config from URL parameter
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setConfig(template.defaultConfig);
        setIsTemplate(true);
      }
    }
  }, [searchParams]);

  const handleExportSVG = useCallback(() => {
    const svgContent = generatePatternSVG(config);
    downloadSVG(svgContent, `${config.shapeType}-pattern-${config.width}x${config.height}x${config.depth}`);
  }, [config]);

  const handleExportSTL = useCallback(() => {
    // STL export would use Three.js scene
    alert('STL export - requires Three.js scene reference. See export/stl.ts');
  }, []);

  return (
    <div className="editor">
      <div className="editor-sidebar">
        <ConfigPanel config={config} onChange={setConfig} hideShapeType={isTemplate} />
        <ExportButtons onExportSVG={handleExportSVG} onExportSTL={handleExportSTL} />
      </div>

      <div className="editor-canvas">
        <DualScene config={config} showFoldLines />
      </div>
    </div>
  );
}
