import * as THREE from 'three';

// Shape types
export type ShapeType = 'box' | 'pyramid' | 'envelope' | 'cylinder' | 'prism';

// Fold pattern types
export interface FoldLine {
  start: THREE.Vector3;
  end: THREE.Vector3;
  type: 'mountain' | 'valley' | 'cut';
}

export interface FoldPattern {
  name: string;
  vertices: THREE.Vector3[];
  foldLines: FoldLine[];
  faces: number[][];
}

export interface PatternConfig {
  shapeType: ShapeType;
  width: number;
  height: number;
  depth: number;
  thickness: number;
}

// Export types
export interface SVGExportOptions {
  width: number;
  height: number;
  includeLayers: boolean;
  strokeWidth: number;
}

export interface STLExportOptions {
  binary: boolean;
  scale: number;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'box' | 'envelope' | 'origami' | 'custom';
  defaultConfig: PatternConfig;
}

// AdSense
declare global {
  interface Window {
    adsbygoogle: object[];
  }
}
