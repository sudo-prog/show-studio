import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useStore } from '../../context/StoreContext';
import { damp } from '../../utils/math3d';

export const RoomScene: React.FC = () => {
  const { brandSettings, selectedProduct } = useStore();
  const letteringOpacity = useRef(0.85);

  // FIX A: Nike swoosh shape for CLOTHING sign only
  const swooshShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.30, -0.02);
    s.quadraticCurveTo(-0.05, 0.06, 0.14, 0.10);
    s.quadraticCurveTo(0.02, 0.02, -0.26, -0.06);
    s.closePath();
    const g = new THREE.ShapeGeometry(s, 32);
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Build Prompt 8: fade wall lettering when a product is open
    const targetOpacity = selectedProduct ? 0.0 : 0.75;
    letteringOpacity.current = damp(letteringOpacity.current, targetOpacity, 6.0, dt);
  });

  // Pegboard dot grid: the reference wall is covered in a regular grid of
  // small recessed holes. Rendered as one InstancedMesh per wall for
  // performance (a few thousand tiny meshes would kill the frame rate).
  const pegHoles = useMemo(() => {
    const holes: { x: number; y: number }[] = [];
    const spacing = 0.085;
    const cols = 86;
    const rows = 76;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        holes.push({
          x: -3.6 + c * spacing + (r % 2 ? spacing / 2 : 0),
          y: -1.95 + r * spacing,
        });
      }
    }
    return holes;
  }, []);

  const PegGrid: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation }) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
      if (!ref.current) return;
      pegHoles.forEach((h, i) => {
        dummy.position.set(h.x, h.y, 0.012);
        dummy.updateMatrix();
        ref.current!.setMatrixAt(i, dummy.matrix);
      });
      ref.current!.instanceMatrix.needsUpdate = true;
    }, [dummy, pegHoles]);

    return (
      <instancedMesh ref={ref} args={[undefined, undefined, pegHoles.length]} position={position} rotation={rotation}>
        <circleGeometry args={[0.015, 8]} />
        <meshBasicMaterial color="#c6c0b3" transparent opacity={0.6} />
      </instancedMesh>
    );
  };

  const wallColor = brandSettings.wallColor || '#ded6c5';
  const floorColor = brandSettings.floorColor || '#e8e5de';

  return (
    <group>
      {/* ----------------- 4 ROOM WALLS (7m x 7m) ----------------- */}
      {/* 1. Back Wall (Z = -3.5, Apparel section) */}
      <mesh position={[0, 1.2, -3.52]} receiveShadow>
        <planeGeometry args={[7.2, 6.4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Floor - coloured as wall so no visible seam in section views */}
<mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
  <planeGeometry args={[10.0, 10.0]} />
  <meshBasicMaterial color="#ded6c5" />
</mesh>
      <PegGrid position={[0, 0, -3.49]} />
      {/* 2. Front Wall (Z = 3.5, Bags section) */}
      <mesh position={[0, 1.2, 3.52]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[7.2, 6.4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* 3. Right Wall (X = 3.5, Shoes section) */}
      <mesh position={[3.52, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.2, 6.4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>

      {/* No peg grid on shoes wall - reference has smooth cream */}
      {/* 4. Left Wall (X = -3.5, Caps section) */}
      <mesh position={[-3.52, 1.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.2, 6.4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      <PegGrid position={[-3.49, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Shoes Sign — suspended black board with chains */}
      <group position={[3.43, 2.0, -0.01]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Chains */}
        <mesh position={[-0.58, 0.17, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.30, 8]} />
          <meshStandardMaterial color="#52525b" metalness={0.9} roughness={0.35} />
        </mesh>
        <mesh position={[0.58, 0.17, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.30, 8]} />
          <meshStandardMaterial color="#52525b" metalness={0.9} roughness={0.35} />
        </mesh>
        {/* Board */}
        <mesh castShadow>
          <boxGeometry args={[1.072, 0.32, 0.04]} />
          <meshStandardMaterial color="#18181b" roughness={0.55} metalness={0.15} />
        </mesh>
        <Text
          fontSize={0.142}
          letterSpacing={0.04}
          color="#fafaf9"
          fillOpacity={letteringOpacity.current}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.03]}
        >
          SHOES
        </Text>
      </group>

      {/* Caps Sign — suspended black board with chains */}
      <group position={[-3.43, 2.32, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Chains */}
        <mesh position={[-0.66, 0.17, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.30, 8]} />
          <meshStandardMaterial color="#52525b" metalness={0.9} roughness={0.35} />
        </mesh>
        <mesh position={[0.66, 0.17, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.30, 8]} />
          <meshStandardMaterial color="#52525b" metalness={0.9} roughness={0.35} />
        </mesh>
        {/* Board */}
        <mesh castShadow>
          <boxGeometry args={[1.218, 0.32, 0.04]} />
          <meshStandardMaterial color="#18181b" roughness={0.55} metalness={0.15} />
        </mesh>
        <Text
          fontSize={0.161}
          letterSpacing={0.04}
          color="#fafaf9"
          fillOpacity={letteringOpacity.current}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.03]}
        >
          CAPS
        </Text>
      </group>

      {/* BIG NIKE WALL LOGO (back wall) */}
      <group position={[-0.05, 2.4, -3.47]}>
        <Text
              fontSize={0.62}
              color="#111111"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
              fontWeight={700}
            >
              NIKE
            </Text>
        <mesh geometry={swooshShape} position={[0.62, 0.0, 0.01]} scale={[1.55, 1.55, 1.55]}>
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>

      {/* Framed Architectural Posters on corner walls */}
      <group position={[-2.8, 0.6, -3.48]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 1.0, 0.02]} />
          <meshStandardMaterial color="#1c1917" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.62, 0.92]} />
          <meshBasicMaterial color="#f4f4f5" />
        </mesh>
      </group>

      <group position={[2.8, 0.6, -3.48]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 1.0, 0.02]} />
          <meshStandardMaterial color="#1c1917" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.62, 0.92]} />
          <meshBasicMaterial color="#f4f4f5" />
        </mesh>
      </group>

      {/* Ambient and Fill Lighting */}
      <ambientLight intensity={2.8} color="#fafafa" />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.8} color="#f0f0f0" />
      {/* Bottom fill to prevent dark wall base */}
      <directionalLight position={[0, -2, 0]} intensity={0.6} color="#fafafa" />
    </group>
  );
};
