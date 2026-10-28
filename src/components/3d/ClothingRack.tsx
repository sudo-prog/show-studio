import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { PhotoGarment } from './PhotoGarment';
import { calculateRackOffsets } from '../../utils/math3d';

export const ClothingRack: React.FC = () => {
  const { inventory, selectedProduct, openProduct } = useStore();
  const garments = useMemo(
    () => inventory.filter((p) => p.category === 'clothing'),
    [inventory]
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Rail dimensions
  const railLength = 3.0; // meters
  const railY = 0.45; // height in world coords
  const railZ = -3.2; // meters
  const wallZ = -3.48; // wall bracket depth

  // Base X coordinates for each garment
  const spacing = 0.23; // side-on spacing
  const startX = -((garments.length - 1) * spacing) / 2;
  const basePositions = useMemo(() => {
    return garments.map((_, i) => startX + i * spacing);
  }, [garments, startX, spacing]);

  // Compute slide offsets
  const slideOffsets = useMemo(() => {
    const hoveredWidth = hoveredIndex !== null ? garments[hoveredIndex]?.views.front.size[0] || 0.62 : 0.62;
    return calculateRackOffsets(garments.length, hoveredIndex, hoveredWidth, spacing);
  }, [garments, hoveredIndex, spacing]);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const hitPoint = e.point;
    const localX = hitPoint.x;

    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < basePositions.length; i++) {
      const dist = Math.abs(localX - basePositions[i]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    const reach = 0.22;
    if (minDistance < reach) {
      if (hoveredIndex !== closestIdx) {
        setHoveredIndex(closestIdx);
      }
    }
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <group position={[0, railY, railZ]}>
      {/* Overhead Apparel Spotlight */}
      <spotLight
        position={[0, 2.2, 0.6]}
        intensity={22}
        angle={0.65}
        penumbra={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 3m Chrome Clothing Rail */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, railLength, 32]} />
        <meshStandardMaterial
          color="#f3f4f6"
          metalness={0.98}
          roughness={0.1}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* Wall Brackets (Left & Right) */}
      {[-1.3, 1.3].map((bracketX, idx) => (
        <group key={idx} position={[bracketX, 0.42, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, (wallZ - railZ) / 2]}>
            <cylinderGeometry args={[0.014, 0.014, Math.abs(wallZ - railZ), 16]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0, wallZ - railZ + 0.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.01, 24]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Rail End Caps */}
      {[-railLength / 2, railLength / 2].map((x, idx) => (
        <mesh key={idx} position={[x, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#f3f4f6" metalness={0.96} roughness={0.12} />
        </mesh>
      ))}

      {/* Garments on Rail */}
      {garments.map((product, idx) => (
        <PhotoGarment
          key={product.id}
          product={product}
          index={idx}
          baseX={basePositions[idx]}
          slideOffset={slideOffsets[idx]}
          isHovered={hoveredIndex === idx}
          isOpened={selectedProduct?.id === product.id}
          onSelect={() => {
            // First tap / hover centers & turns it
            if (hoveredIndex !== idx) {
              setHoveredIndex(idx);
            }
          }}
          onClick={() => {
            // Second tap or direct click opens it
            if (hoveredIndex === idx) {
              openProduct(product);
            } else {
              setHoveredIndex(idx);
              openProduct(product);
            }
          }}
        />
      ))}

      {/* ONE Invisible Hover Zone over the rack */}
      <mesh
        position={[0, 0, 0.1]}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => {
          e.stopPropagation();
          if (hoveredIndex !== null && garments[hoveredIndex]) {
            openProduct(garments[hoveredIndex]);
          }
        }}
        visible={false}
      >
        <planeGeometry args={[railLength + 0.4, 1.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};
