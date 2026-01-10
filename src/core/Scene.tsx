import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { PatternConfig, ShapeType } from '@/types';

interface FoldMeshProps {
  config: PatternConfig;
}

function FoldMesh({ config }: FoldMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  const { shapeType, width, height, depth } = config;

  const geometry = useMemo(() => {
    switch (shapeType) {
      case 'pyramid':
        return <coneGeometry args={[width / 2, height, 4]} />;
      case 'cylinder':
        return <cylinderGeometry args={[width / 2, width / 2, height, 32]} />;
      case 'prism':
        return <cylinderGeometry args={[width / 2, width / 2, height, 6]} />;
      case 'envelope':
        // Flat envelope shape
        return <boxGeometry args={[width, height * 0.1, depth]} />;
      case 'box':
      default:
        return <boxGeometry args={[width, height, depth]} />;
    }
  }, [shapeType, width, height, depth]);

  const yOffset = shapeType === 'envelope' ? height * 0.05 : height / 2;

  return (
    <mesh ref={meshRef} position={[0, yOffset, 0]}>
      {geometry}
      <meshStandardMaterial
        color={getShapeColor(shapeType)}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
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

function FoldLines({ config }: FoldMeshProps) {
  const { shapeType, width, height, depth } = config;

  // Different fold lines based on shape
  const lines = useMemo(() => {
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
      const apex: [number, number, number] = [0, height, 0];
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
        <line key={`mountain-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0], ...line[1]])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#0000FF" linewidth={2} />
        </line>
      ))}
      {lines.valley.map((line, i) => (
        <line key={`valley-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0], ...line[1]])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00FF00" linewidth={2} />
        </line>
      ))}
    </group>
  );
}

interface SceneProps {
  config: PatternConfig;
  showFoldLines?: boolean;
}

export function Scene({ config, showFoldLines = true }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      style={{ background: '#1a1a2e' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <FoldMesh config={config} />
      {showFoldLines && <FoldLines config={config} />}

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
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />

      <Environment preset="city" />
    </Canvas>
  );
}
