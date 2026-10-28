import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useStore } from '../../context/StoreContext';
import { damp } from '../../utils/math3d';

export const RoomScene: React.FC = () => {
  const { brandSettings, selectedProduct } = useStore();
  const letteringOpacity = useRef(0.85);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Build Prompt 8: fade wall lettering when a product is open
    const targetOpacity = selectedProduct ? 0.0 : 0.75;
    letteringOpacity.current = damp(letteringOpacity.current, targetOpacity, 6.0, dt);
  });

  const wallColor = brandSettings.wallColor || '#e4e2dc';
  const floorColor = brandSettings.floorColor || '#e8e5de';

  return (
    <group>
      {/* ----------------- FLOOR ----------------- */}
      {/* Polished studio concrete floor with smooth sheen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]} receiveShadow>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.28}
          metalness={0.12}
        />
      </mesh>

      {/* ----------------- CEILING ----------------- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.6, 0]}>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.9} />
      </mesh>

      {/* Modern recessed linear ceiling light strips */}
      {[-2, 0, 2].map((z, idx) => (
        <group key={idx} position={[0, 2.58, z]}>
          <mesh>
            <boxGeometry args={[5.5, 0.04, 0.12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <pointLight color="#fff7ed" intensity={3.5} distance={5} />
        </group>
      ))}

      {/* ----------------- 4 ROOM WALLS (7m x 7m) ----------------- */}
      {/* 1. Back Wall (Z = -3.5, Apparel section) */}
      <mesh position={[0, 0.8, -3.52]} receiveShadow>
        <planeGeometry args={[7.2, 3.6]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* 2. Front Wall (Z = 3.5, Bags section) */}
      <mesh position={[0, 0.8, 3.52]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[7.2, 3.6]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* 3. Right Wall (X = 3.5, Shoes section) */}
      <mesh position={[3.52, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.2, 3.6]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* 4. Left Wall (X = -3.5, Caps section) */}
      <mesh position={[-3.52, 0.8, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7.2, 3.6]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>

      {/* Baseboards (Perimeter trim) */}
      <mesh position={[0, -0.96, -3.49]}>
        <boxGeometry args={[7.0, 0.08, 0.03]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.96, 3.49]}>
        <boxGeometry args={[7.0, 0.08, 0.03]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.6} />
      </mesh>
      <mesh position={[3.49, -0.96, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[7.0, 0.08, 0.03]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.6} />
      </mesh>
      <mesh position={[-3.49, -0.96, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[7.0, 0.08, 0.03]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.6} />
      </mesh>

      {/* ----------------- WALL DEPARTMENT LETTERING (Build Prompt 8) ----------------- */}
      {/* Apparel Sign (Back Wall) */}
      <group position={[0, 1.75, -3.48]}>
        <Text
          fontSize={0.24}
          letterSpacing={0.18}
          color="#18181b"
          fillOpacity={letteringOpacity.current}
          anchorX="center"
          anchorY="middle"
        >
          COLLECTION / APPAREL
        </Text>
      </group>

      {/* Footwear Sign (Right Wall) */}
      <group position={[3.48, 1.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Text
          fontSize={0.24}
          letterSpacing={0.18}
          color="#18181b"
          fillOpacity={letteringOpacity.current}
          anchorX="center"
          anchorY="middle"
        >
          FOOTWEAR STUDIO
        </Text>
      </group>

      {/* Bags Sign (Front Wall) */}
      <group position={[0, 1.75, 3.48]} rotation={[0, Math.PI, 0]}>
        <Text
          fontSize={0.24}
          letterSpacing={0.18}
          color="#18181b"
          fillOpacity={letteringOpacity.current}
          anchorX="center"
          anchorY="middle"
        >
          BAGS & UTILITY
        </Text>
      </group>

      {/* Caps Sign (Left Wall) */}
      <group position={[-3.48, 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Text
          fontSize={0.24}
          letterSpacing={0.18}
          color="#18181b"
          fillOpacity={letteringOpacity.current}
          anchorX="center"
          anchorY="middle"
        >
          HEADWEAR ARCHIVE
        </Text>
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
      <ambientLight intensity={1.2} color="#fbfbfa" />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.8} color="#fef3c7" />
    </group>
  );
};
