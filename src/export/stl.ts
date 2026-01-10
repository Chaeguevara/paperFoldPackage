import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { STLExportOptions } from '@/types';

const DEFAULT_OPTIONS: STLExportOptions = {
  binary: true,
  scale: 1,
};

/**
 * Validate mesh for 3D printing
 */
export function validateMesh(mesh: THREE.Mesh): string[] {
  const issues: string[] = [];
  const geometry = mesh.geometry;

  if (!geometry) {
    issues.push('Mesh has no geometry');
    return issues;
  }

  if (!geometry.attributes.position) {
    issues.push('Geometry has no position attribute');
    return issues;
  }

  // Check normals
  if (!geometry.attributes.normal) {
    issues.push('Normals missing - will be computed');
  }

  // Check bounding box size (assuming mm)
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);

  if (size.x > 500 || size.y > 500 || size.z > 500) {
    issues.push(`Large model (${size.x.toFixed(0)}x${size.y.toFixed(0)}x${size.z.toFixed(0)}) - verify scale`);
  }

  return issues;
}

/**
 * Export mesh to STL
 */
export function exportToSTL(
  mesh: THREE.Mesh,
  filename: string,
  options: Partial<STLExportOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Ensure normals exist
  if (!mesh.geometry.attributes.normal) {
    mesh.geometry.computeVertexNormals();
  }

  // Apply scale if needed
  let exportMesh = mesh;
  if (opts.scale !== 1) {
    exportMesh = mesh.clone();
    exportMesh.scale.multiplyScalar(opts.scale);
    exportMesh.updateMatrixWorld();
  }

  const exporter = new STLExporter();

  if (opts.binary) {
    const result = exporter.parse(exportMesh, { binary: true });
    const buffer = result instanceof ArrayBuffer ? result : (result as DataView).buffer;
    downloadBuffer(buffer as ArrayBuffer, filename);
  } else {
    const ascii = exporter.parse(exportMesh) as string;
    downloadText(ascii, filename);
  }
}

/**
 * Export entire scene to STL
 */
export function exportSceneToSTL(
  scene: THREE.Scene,
  filename: string,
  options: Partial<STLExportOptions> = {}
): void {
  const geometries: THREE.BufferGeometry[] = [];

  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const geo = obj.geometry.clone();
      obj.updateMatrixWorld();
      geo.applyMatrix4(obj.matrixWorld);
      geometries.push(geo);
    }
  });

  if (geometries.length === 0) {
    console.error('No meshes found in scene');
    return;
  }

  const merged = mergeGeometries(geometries);
  const mesh = new THREE.Mesh(merged);

  exportToSTL(mesh, filename, options);
}

function downloadBuffer(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  downloadBlob(blob, filename);
}

function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.stl') ? filename : `${filename}.stl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
