import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { PhotoGarment } from './PhotoGarment';
import { calculateRackOffsets } from '../../utils/math3d';

export const ClothingRack: React.FC = () => {
  const { inventory, selectedProduct, openProduct, activeSection } = useStore();
  const isOverview = activeSection === 'store';
  const count = isOverview ? 10 : 6;
  const spacing = isOverview ? 0.52 : 0.85;
  const railLength = isOverview ? 5.2 : 4.5;
  const garments = useMemo(
    () => inventory.filter((p) => p.category === 'clothing').slice(0, count),
    [inventory, count]
  );

  // hoveredIndex: proximity hover via invisible zone (slides neighbors)
  // tappedIndex: first-tap reveal state — second tap on the SAME item opens modal
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  // Rail dimensions
  const railY = 0.95; // height in world coords
  const railZ = -3.2; // meters
  const wallZ = -3.48; // wall bracket depth

  // Base X coordinates for each garment
  const startX = -((garments.length - 1) * spacing) / 2;
  const basePositions = useMemo(() => {
    return garments.map((_, i) => startX + i * spacing);
  }, [garments, startX, spacing]);

  // Compute slide offsets (driven by proximity hover)
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
        <cylinderGeometry args={[0.006, 0.006, railLength, 32]} />
        <meshStandardMaterial
          color="#3f3f46"
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
        </group>
      ))}

      {/* Rail End Caps — removed in L3 (thin dark line, no caps) */}

      {/* Garments on Rail */}
      {garments.map((product, idx) => (
        <group key={product.id} scale={[isOverview ? 0.72 : 0.9, 2.1, 1]} position={[basePositions[idx], -0.42, 0]}>
          <PhotoGarment
            product={product}
            index={idx}
            baseX={basePositions[idx]}
            slideOffset={slideOffsets[idx]}
            isHovered={hoveredIndex === idx}
            isOpened={selectedProduct?.id === product.id}
            isRevealed={tappedIndex === idx}
            onSelect={() => {
              // First tap / proximity hover: center & reveal this garment's info
              setHoveredIndex(idx);
              // Reset reveal state for any previously tapped item so each starts fresh
              setTappedIndex((prev) => (prev === idx ? prev : idx));
            }}
            onClick={() => {
              // Single tap opens the product card immediately (matches reference).
              setHoveredIndex(idx);
              openProduct(product);
            }}
          />
        </group>
      ))}

      {/* ONE Invisible Hover Zone over the rack */}
      <mesh
        position={[0, 0, 0.1]}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => {
          e.stopPropagation();
          // Single tap on empty space opens nearest garment
          openProduct(garments[hoveredIndex]);
        }}
        visible={false}
      >
        <planeGeometry args={[railLength + 0.4, 1.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};
