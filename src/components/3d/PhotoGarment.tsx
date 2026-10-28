import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Product } from '../../types/store';
import { damp, getGarmentCardPose } from '../../utils/math3d';

interface PhotoGarmentProps {
  product: Product;
  index: number;
  baseX: number;
  slideOffset: number;
  isHovered: boolean;
  isOpened: boolean;
  onClick: () => void;
  onSelect: () => void;
}

export const PhotoGarment: React.FC<PhotoGarmentProps> = ({
  product,
  baseX,
  slideOffset,
  isHovered,
  isOpened,
  onClick,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  const hookRef = useRef<THREE.Group>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);

  // Textures for front, side, and back views
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const frontTex = loader.load(product.views.front.imageUrl);
    const sideTex = loader.load(product.views.side.imageUrl);
    const backTex = loader.load(product.views.back.imageUrl);

    [frontTex, sideTex, backTex].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
    });

    return { front: frontTex, side: sideTex, back: backTex };
  }, [product]);

  const currentAngle = useRef<number>(-1.35);
  const currentX = useRef<number>(baseX);
  const currentLift = useRef<number>(0);
  const currentSway = useRef<number>(0);
  const swayPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  const frontWidth = product.views.front.size[0];
  const frontHeight = product.views.front.size[1];
  const sideWidth = product.views.side.size[0];

  useFrame((state, delta) => {
    if (!groupRef.current || !cardRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Vertical lift when hovered or dragging
    const targetLift = isHovered || isDragging ? 0.04 : 0;
    currentLift.current = damp(currentLift.current, targetLift, 12.0, dt);
    cardRef.current.position.y = currentLift.current;

    if (!isDragging) {
      const targetAngle = isHovered ? 0 : -1.35;
      currentAngle.current = damp(currentAngle.current, targetAngle, 12.0, dt);
    }

    const targetX = baseX + slideOffset;
    currentX.current = damp(currentX.current, targetX, 14.0, dt);
    groupRef.current.position.x = currentX.current;

    const swayAmplitude = isHovered || isDragging ? 0.025 : 0.012;
    const swaySpeed = isHovered || isDragging ? 3.5 : 1.8;
    const targetSway = Math.sin(state.clock.elapsedTime * swaySpeed + swayPhase) * swayAmplitude;
    currentSway.current = damp(currentSway.current, targetSway, 6.0, dt);

    if (hookRef.current) {
      hookRef.current.rotation.z = currentSway.current;
    }

    const pose = getGarmentCardPose(currentAngle.current);

    let activeTex = textures.front;
    let cardW = frontWidth;
    if (pose.view === 'side' || pose.view === 'mirroredSide') {
      activeTex = textures.side;
      cardW = sideWidth;
    } else if (pose.view === 'back') {
      activeTex = textures.back;
      cardW = frontWidth;
    }

    const mat = cardRef.current.material as THREE.MeshBasicMaterial;
    if (mat.map !== activeTex) {
      mat.map = activeTex;
      mat.needsUpdate = true;
    }

    if (pose.flipX) {
      activeTex.repeat.x = -1;
      activeTex.offset.x = 1;
    } else {
      activeTex.repeat.x = 1;
      activeTex.offset.x = 0;
    }

    cardRef.current.scale.set(pose.widthScale * (cardW / frontWidth), 1, 1);
    cardRef.current.rotation.y = pose.tiltAngle;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = currentAngle.current;
    onSelect();
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const deltaX = e.clientX - dragStartX.current;
    currentAngle.current = dragStartAngle.current + deltaX * 0.015;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  };

  if (isOpened) return null;

  return (
    <group ref={groupRef} position={[baseX, 0, 0]}>
      {/* Chrome Hook assembly hanging from rail */}
      <group ref={hookRef} position={[0, frontHeight * 0.48, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.08, 16]} />
          <meshStandardMaterial metalness={0.95} roughness={0.15} color="#e5e7eb" />
        </mesh>
        <mesh position={[0, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.016, 0.003, 16, 24, Math.PI * 1.5]} />
          <meshStandardMaterial metalness={0.95} roughness={0.15} color="#e5e7eb" />
        </mesh>
      </group>

      {/* Garment Studio Card (faces camera & responsive to touch/pointer drag) */}
      <mesh
        ref={cardRef}
        position={[0, 0, 0]}
        castShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={() => setIsDragging(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <planeGeometry args={[frontWidth, frontHeight]} />
        <meshBasicMaterial
          map={textures.front}
          transparent
          alphaTest={0.02}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
