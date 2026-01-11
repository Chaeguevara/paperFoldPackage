/**
 * STL Exporter Utility with Validation for 3D Printing
 */

import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface STLExportOptions {
  binary?: boolean;
  scale?: number;
}

export interface PrintValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

/**
 * Validate mesh for 3D printing
 */
export function validateForPrint(mesh: THREE.Mesh): PrintValidationIssue[] {
  const issues: PrintValidationIssue[] = [];
  const geometry = mesh.geometry;

  if (!geometry) {
    issues.push({ type: 'error', message: 'Mesh has no geometry' });
    return issues;
  }

  if (!geometry.attributes.position) {
    issues.push({ type: 'error', message: 'Geometry has no position attribute' });
    return issues;
  }

  // Check for normals
  if (!geometry.attributes.normal) {
    issues.push({ type: 'warning', message: 'No normals - will be computed' });
  }

  // Check for indexed geometry
  if (!geometry.index) {
    issues.push({ type: 'warning', message: 'Non-indexed geometry - may have duplicate vertices' });
  }

  // Check bounding box for reasonable size (assuming mm)
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);

  if (size.x > 1000 || size.y > 1000 || size.z > 1000) {
    issues.push({ type: 'warning', message: `Large model (${size.x.toFixed(0)}x${size.y.toFixed(0)}x${size.z.toFixed(0)}) - verify units are mm` });
  }

  if (size.x < 1 && size.y < 1 && size.z < 1) {
    issues.push({ type: 'warning', message: 'Very small model - may need scaling for print' });
  }

  return issues;
}

/**
 * Export mesh to STL
 */
export function exportToSTL(
  mesh: THREE.Mesh,
  filename: string,
  options: STLExportOptions = {}
): void {
  const { binary = true, scale = 1 } = options;

  // Clone and scale if needed
  let exportMesh = mesh;
  if (scale !== 1) {
    exportMesh = mesh.clone();
    exportMesh.scale.multiplyScalar(scale);
    exportMesh.updateMatrixWorld();
  }

  // Ensure normals exist
  if (!exportMesh.geometry.attributes.normal) {
    exportMesh.geometry.computeVertexNormals();
  }

  const exporter = new STLExporter();

  if (binary) {
    const buffer = exporter.parse(exportMesh, { binary: true }) as ArrayBuffer;
    downloadBlob(new Blob([buffer], { type: 'application/octet-stream' }), filename);
  } else {
    const ascii = exporter.parse(exportMesh) as string;
    downloadBlob(new Blob([ascii], { type: 'text/plain' }), filename);
  }
}

/**
 * Export entire scene to single STL
 */
export function exportSceneToSTL(
  scene: THREE.Scene,
  filename: string,
  options: STLExportOptions = {}
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

  const merged = BufferGeometryUtils.mergeGeometries(geometries);
  const mesh = new THREE.Mesh(merged);

  exportToSTL(mesh, filename, options);
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
