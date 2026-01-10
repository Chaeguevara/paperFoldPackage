import * as THREE from 'three';
import type { FoldPattern, FoldLine, PatternConfig } from '@/types';

/**
 * Generate a basic box fold pattern
 */
export function generateBoxPattern(config: PatternConfig): FoldPattern {
  const { width, height, depth } = config;
  const hw = width / 2;
  const hd = depth / 2;

  // Vertices for unfolded box pattern
  const vertices: THREE.Vector3[] = [
    // Bottom face
    new THREE.Vector3(-hw, 0, -hd),
    new THREE.Vector3(hw, 0, -hd),
    new THREE.Vector3(hw, 0, hd),
    new THREE.Vector3(-hw, 0, hd),
    // Top face (offset for unfolding)
    new THREE.Vector3(-hw, height, -hd),
    new THREE.Vector3(hw, height, -hd),
    new THREE.Vector3(hw, height, hd),
    new THREE.Vector3(-hw, height, hd),
  ];

  // Fold lines
  const foldLines: FoldLine[] = [
    // Bottom edges (mountain folds)
    { start: vertices[0], end: vertices[1], type: 'mountain' },
    { start: vertices[1], end: vertices[2], type: 'mountain' },
    { start: vertices[2], end: vertices[3], type: 'mountain' },
    { start: vertices[3], end: vertices[0], type: 'mountain' },
    // Top edges (valley folds)
    { start: vertices[4], end: vertices[5], type: 'valley' },
    { start: vertices[5], end: vertices[6], type: 'valley' },
    { start: vertices[6], end: vertices[7], type: 'valley' },
    { start: vertices[7], end: vertices[4], type: 'valley' },
  ];

  // Face indices
  const faces = [
    [0, 1, 2, 3], // bottom
    [4, 5, 6, 7], // top
    [0, 1, 5, 4], // front
    [2, 3, 7, 6], // back
    [1, 2, 6, 5], // right
    [3, 0, 4, 7], // left
  ];

  return {
    name: 'Box',
    vertices,
    foldLines,
    faces,
  };
}

/**
 * Convert fold pattern to Three.js mesh
 */
export function patternToMesh(
  pattern: FoldPattern,
  material?: THREE.Material
): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();

  // Convert faces to triangles
  const positions: number[] = [];
  const indices: number[] = [];

  pattern.vertices.forEach((v) => {
    positions.push(v.x, v.y, v.z);
  });

  pattern.faces.forEach((face) => {
    // Triangulate quad faces
    if (face.length === 4) {
      indices.push(face[0], face[1], face[2]);
      indices.push(face[0], face[2], face[3]);
    } else if (face.length === 3) {
      indices.push(face[0], face[1], face[2]);
    }
  });

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material || defaultMaterial);
}

/**
 * Create fold lines as Three.js line segments
 */
export function createFoldLineGeometry(
  foldLines: FoldLine[]
): Map<string, THREE.BufferGeometry> {
  const geometries = new Map<string, THREE.BufferGeometry>();

  const types = ['mountain', 'valley', 'cut'] as const;

  types.forEach((type) => {
    const lines = foldLines.filter((l) => l.type === type);
    if (lines.length === 0) return;

    const positions: number[] = [];
    lines.forEach((line) => {
      positions.push(
        line.start.x, line.start.y, line.start.z,
        line.end.x, line.end.y, line.end.z
      );
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    geometries.set(type, geometry);
  });

  return geometries;
}
