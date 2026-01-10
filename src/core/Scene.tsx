import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { PatternConfig, ShapeType, FoldPattern } from '@/types';
import { generatePattern, patternToMesh } from './geometry';

interface FoldMeshProps {
  config: PatternConfig;
  viewMode: 'pattern' | '3d';
}

/**
 * Renders the 2D unfolding pattern (전개도) or 3D preview
 */
function FoldMesh({ config, viewMode }: FoldMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Only rotate in 3D view mode
    if (viewMode === '3d' && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  const { shapeType, width, height, depth } = config;

  // Generate pattern for 2D view
  const pattern = useMemo(() => {
    return generatePattern(config);
  }, [config]);

  // 3D preview geometry
  const geometry3D = useMemo(() => {
    switch (shapeType) {
      case 'pyramid':
        return <coneGeometry args={[width / 2, height, 4]} />;
      case 'cylinder':
        return <cylinderGeometry args={[width / 2, width / 2, height, 32]} />;
      case 'prism':
        return <cylinderGeometry args={[width / 2, width / 2, height, 6]} />;
      case 'envelope':
        return <boxGeometry args={[width, height * 0.1, depth]} />;
      case 'box':
      default:
        return <boxGeometry args={[width, height, depth]} />;
    }
  }, [shapeType, width, height, depth]);

  if (viewMode === '3d') {
    const yOffset = shapeType === 'envelope' ? height * 0.05 : height / 2;

    return (
      <mesh ref={meshRef} position={[0, yOffset, 0]}>
        {geometry3D}
        <meshStandardMaterial
          color={getShapeColor(shapeType)}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  // 2D Pattern View - show the flat unfolded pattern
  return (
    <group ref={groupRef}>
      <PatternMesh pattern={pattern} shapeType={shapeType} />
    </group>
  );
}

/**
 * Render the 2D pattern mesh (flat 전개도)
 */
function PatternMesh({ pattern, shapeType }: { pattern: FoldPattern; shapeType: ShapeType }) {
  const mesh = useMemo(() => {
    return patternToMesh(pattern);
  }, [pattern]);

  return (
    <primitive object={mesh}>
      <meshStandardMaterial
        color={getShapeColor(shapeType)}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </primitive>
  );
}

function getShapeColor(shapeType: ShapeType): string {
  const colors: Record<ShapeType, string> = {
    box: '#4F46E5',
    pyramid: '#10B981',
    cylinder: '#F59E0B',
    prism: '#EC4899',
    envelope: '#8B5CF6',
  };
  return colors[shapeType];
}

interface FoldLinesProps {
  config: PatternConfig;
  viewMode: 'pattern' | '3d';
}

/**
 * Renders fold lines with proper styling:
 * - Cut lines: Red, solid
 * - Mountain folds: Blue, dashed
 * - Valley folds: Green, dashed
 */
function FoldLines({ config, viewMode }: FoldLinesProps) {
  const pattern = useMemo(() => {
    return generatePattern(config);
  }, [config]);

  // For 3D view, show simplified fold lines on the shape
  if (viewMode === '3d') {
    return <FoldLines3D config={config} />;
  }

  // For 2D pattern view, show all lines from the pattern
  const { foldLines } = pattern;

  const cutLines = foldLines.filter(l => l.type === 'cut');
  const mountainLines = foldLines.filter(l => l.type === 'mountain');
  const valleyLines = foldLines.filter(l => l.type === 'valley');

  return (
    <group>
      {/* Cut lines - Red, solid, thicker */}
      {cutLines.map((line, i) => (
        <Line
          key={`cut-${i}`}
          points={[
            [line.start.x, line.start.y + 0.01, line.start.z],
            [line.end.x, line.end.y + 0.01, line.end.z],
          ]}
          color="#EF4444"
          lineWidth={3}
        />
      ))}

      {/* Mountain folds - Blue, dashed */}
      {mountainLines.map((line, i) => (
        <Line
          key={`mountain-${i}`}
          points={[
            [line.start.x, line.start.y + 0.01, line.start.z],
            [line.end.x, line.end.y + 0.01, line.end.z],
          ]}
          color="#3B82F6"
          lineWidth={2}
          dashed
          dashSize={0.15}
          gapSize={0.08}
        />
      ))}

      {/* Valley folds - Green, dashed (smaller dashes) */}
      {valleyLines.map((line, i) => (
        <Line
          key={`valley-${i}`}
          points={[
            [line.start.x, line.start.y + 0.01, line.start.z],
            [line.end.x, line.end.y + 0.01, line.end.z],
          ]}
          color="#22C55E"
          lineWidth={2}
          dashed
          dashSize={0.08}
          gapSize={0.05}
        />
      ))}
    </group>
  );
}

type Point3D = [number, number, number];
type LinePair = [Point3D, Point3D];

/**
 * Simplified fold lines for 3D preview
 */
function FoldLines3D({ config }: { config: PatternConfig }) {
  const { shapeType, width, height, depth } = config;

  const lines = useMemo((): { mountain: LinePair[]; valley: LinePair[] } => {
    if (shapeType === 'envelope') {
      return {
        mountain: [
          [[-width/2, 0.1, 0], [width/2, 0.1, 0]],
        ],
        valley: [
          [[0, 0.1, -depth/2], [0, 0.1, depth/2]],
        ],
      };
    }

    if (shapeType === 'pyramid') {
      const apex: Point3D = [0, height, 0];
      const base = width / 2;
      return {
        mountain: [
          [[-base, 0, -base], apex],
          [[base, 0, -base], apex],
          [[base, 0, base], apex],
          [[-base, 0, base], apex],
        ],
        valley: [
          [[-base, 0, -base], [base, 0, -base]],
          [[base, 0, -base], [base, 0, base]],
        ],
      };
    }

    // Default box fold lines
    return {
      mountain: [
        [[-width/2, height, -depth/2], [width/2, height, -depth/2]],
        [[-width/2, height, depth/2], [width/2, height, depth/2]],
      ],
      valley: [
        [[-width/2, 0, -depth/2], [width/2, 0, -depth/2]],
        [[-width/2, 0, depth/2], [width/2, 0, depth/2]],
      ],
    };
  }, [shapeType, width, height, depth]);

  return (
    <group>
      {lines.mountain.map((line, i) => (
        <Line
          key={`mountain-${i}`}
          points={line}
          color="#3B82F6"
          lineWidth={2}
        />
      ))}
      {lines.valley.map((line, i) => (
        <Line
          key={`valley-${i}`}
          points={line}
          color="#22C55E"
          lineWidth={2}
        />
      ))}
    </group>
  );
}

interface SingleSceneProps {
  config: PatternConfig;
  showFoldLines?: boolean;
  viewMode: 'pattern' | '3d';
}

/**
 * Single view scene component
 */
function SingleScene({ config, showFoldLines = true, viewMode }: SingleSceneProps) {
  // Adjust camera position based on view mode
  const cameraPosition: [number, number, number] = viewMode === 'pattern'
    ? [0, 10, 0]  // Top-down for pattern view
    : [5, 5, 5];   // Isometric for 3D view

  const cameraUp: [number, number, number] = viewMode === 'pattern'
    ? [0, 0, -1]  // Look down Z axis
    : [0, 1, 0];   // Normal up

  return (
    <Canvas
      camera={{
        position: cameraPosition,
        fov: 50,
        up: cameraUp,
      }}
      style={{ background: '#1a1a2e' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <FoldMesh config={config} viewMode={viewMode} />
      {showFoldLines && <FoldLines config={config} viewMode={viewMode} />}

      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6366f1"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#818cf8"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        rotation={viewMode === 'pattern' ? [0, 0, 0] : undefined}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
        maxPolarAngle={viewMode === 'pattern' ? Math.PI / 3 : Math.PI}
        minPolarAngle={0}
      />

      {viewMode === '3d' && <Environment preset="city" />}
    </Canvas>
  );
}

interface SceneProps {
  config: PatternConfig;
  showFoldLines?: boolean;
  viewMode?: 'pattern' | '3d';
}

/**
 * Legacy single scene component for backwards compatibility
 */
export function Scene({ config, showFoldLines = true, viewMode = 'pattern' }: SceneProps) {
  return <SingleScene config={config} showFoldLines={showFoldLines} viewMode={viewMode} />;
}

interface DualSceneProps {
  config: PatternConfig;
  showFoldLines?: boolean;
}

/**
 * Dual view scene - shows 2D pattern (전개도) and 3D preview side by side
 * Users can see the flat cutting template and the final folded result simultaneously
 */
export function DualScene({ config, showFoldLines = true }: DualSceneProps) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: '2px' }}>
      {/* 2D Pattern View (Left) */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 10,
        }}>
          전개도 (Pattern)
        </div>
        <SingleScene config={config} showFoldLines={showFoldLines} viewMode="pattern" />
        <FoldLineLegend />
      </div>

      {/* Divider */}
      <div style={{
        width: '2px',
        background: 'linear-gradient(to bottom, #4F46E5, #818cf8)',
      }} />

      {/* 3D Preview (Right) */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 10,
        }}>
          3D Preview
        </div>
        <SingleScene config={config} showFoldLines={showFoldLines} viewMode="3d" />
      </div>
    </div>
  );
}

/**
 * Legend component for fold line colors
 */
export function FoldLineLegend() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '12px 16px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '12px',
      zIndex: 10,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Fold Lines</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '24px', height: '3px', background: '#EF4444' }} />
        <span>Cut</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{
          width: '24px',
          height: '3px',
          background: 'repeating-linear-gradient(90deg, #3B82F6 0, #3B82F6 6px, transparent 6px, transparent 10px)'
        }} />
        <span>Mountain fold (away)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '24px',
          height: '3px',
          background: 'repeating-linear-gradient(90deg, #22C55E 0, #22C55E 4px, transparent 4px, transparent 7px)'
        }} />
        <span>Valley fold (toward)</span>
      </div>
    </div>
  );
}
