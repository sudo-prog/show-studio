import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Product } from '../../types/store';
import { damp, getGarmentCardPose, clamp, POSITION_DAMPING, ROTATION_DAMPING, HOVER_LIFT, SPRING_CONFIG } from '../../utils/math3d';
import { getTextureUrl } from '../../utils/textures';

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
  const angularVelocity = useRef(0);
  const prevClientX = useRef(0);

  // Textures for front, side, and back views
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const frontTex = loader.load(getTextureUrl(product.category, product.id, 'front'));
    const sideTex = loader.load(getTextureUrl(product.category, product.id, 'side'));
    const backTex = loader.load(getTextureUrl(product.category, product.id, 'back'));

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
    const targetLift = isHovered || isDragging ? HOVER_LIFT : 0;
    currentLift.current = damp(currentLift.current, targetLift, POSITION_DAMPING, dt);
    cardRef.current.position.y = currentLift.current;

    if (isDragging) {
      // During drag, angle follows finger; momentum tracked in handlers
    } else {
      // After release: apply momentum with decay
      angularVelocity.current *= Math.exp(-6.0 * dt);
      currentAngle.current += angularVelocity.current * dt;

      // If no significant momentum, spring snap to nearest quadrant
      // The 4 quadrants: 0 (front), -PI/2 (right side), -PI (back), -3*PI/2 (left/mirrored)
      // currentAngle starts at -1.35 ≈ -PI/2 (side view) by default
      if (Math.abs(angularVelocity.current) < 0.001) {
        const quarter = Math.PI / 2;
        // Normalize angle to [-2PI, 0) for this garment's range
        let angle = currentAngle.current % (Math.PI * 4);
        if (angle > 0) angle -= Math.PI * 4;
        // Find nearest quadrant target
        let nearestQuad = Math.round(angle / quarter) * quarter;
        // Clamp to valid range [-2*PI, 0]
        nearestQuad = clamp(nearestQuad, -Math.PI * 2, 0);
        // Spring snap to nearest quadrant using SPRING_CONFIG
        const springTarget = SPRING_CONFIG.tension * 0.8;
        currentAngle.current = damp(currentAngle.current, nearestQuad, springTarget, dt);
      } else {
        // While momentum is active, apply gentle hover pull
        const targetAngle = isHovered ? 0 : -1.35;
        currentAngle.current = damp(currentAngle.current, targetAngle, ROTATION_DAMPING, dt);
      }
    }

    const targetX = baseX + slideOffset;
    currentX.current = damp(currentX.current, targetX, POSITION_DAMPING + 1, dt);
    groupRef.current.position.x = currentX.current;

    const swayAmplitude = isHovered || isDragging ? 0.025 : 0.012;
    const swaySpeed = isHovered || isDragging ? 3.5 : 1.8;
    const targetSway = Math.sin(state.clock.elapsedTime * swaySpeed + swayPhase) * swayAmplitude;
    currentSway.current = damp(currentSway.current, targetSway, POSITION_DAMPING - 1, dt);

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
    const target = e.currentTarget as Element;
    if (target && typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {}
    }
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = currentAngle.current;
    prevClientX.current = e.clientX;
    angularVelocity.current = 0;
    onSelect();
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const deltaX = e.clientX - dragStartX.current;
    currentAngle.current = dragStartAngle.current + deltaX * 0.015;
    // Track velocity for momentum (pixels per frame → angular velocity)
    const deltaDelta = e.clientX - prevClientX.current;
    angularVelocity.current = -deltaDelta * 0.015 * 0.06;
    prevClientX.current = e.clientX;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const target = e.currentTarget as Element;
    if (target && typeof target.releasePointerCapture === 'function') {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setIsDragging(false);
    // Momentum continues via angularVelocity in useFrame
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
