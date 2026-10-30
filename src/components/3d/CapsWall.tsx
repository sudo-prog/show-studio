import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { damp, clamp, POSITION_DAMPING, ROTATION_DAMPING, SPRING_CONFIG } from '../../utils/math3d';
import { getTextureUrl } from '../../utils/textures';

interface CapDisplayItemProps {
  product: Product;
  position: [number, number, number];
  isOpened: boolean;
  onOpen: () => void;
}

const CapDisplayItem: React.FC<CapDisplayItemProps> = ({
  product,
  position,
  isOpened,
  onOpen,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const angularVelocity = useRef(0);
  const prevClientX = useRef(0);

  const currentAngle = useRef<number>(0);
  const currentLift = useRef<number>(0);

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    // Clone each loaded texture so per-cap repeat/offset (mirror) state is isolated.
    // Mutating the shared texture (loader.load cache) corrupts EVERY cap that uses
    // the same URL, producing the horizontal scanline/wireframe glitch.
    const makeClone = (view: 'front' | 'side' | 'back') => {
      const base = loader.load(getTextureUrl(product.category, product.id, view));
      base.colorSpace = THREE.SRGBColorSpace;
      base.generateMipmaps = false;
      base.minFilter = THREE.LinearFilter;
      return base.clone();
    };
    return { front: makeClone('front'), side: makeClone('side'), back: makeClone('back') };
  }, [product]);

  const capW = product.views.front.size[0];
  const capH = product.views.front.size[1];

  useFrame((_, delta) => {
    if (!groupRef.current || !cardRef.current) return;
    const dt = Math.min(delta, 0.05);

    const targetLift = isHovered || isDragging ? 0.03 : 0;
    currentLift.current = damp(currentLift.current, targetLift, POSITION_DAMPING, dt);
    cardRef.current.position.y = currentLift.current;

    if (!isDragging) {
      // Apply momentum with decay after release
      angularVelocity.current *= Math.exp(-6.0 * dt);
      currentAngle.current += angularVelocity.current * dt;

      // If no significant momentum, spring snap to nearest quadrant
      if (Math.abs(angularVelocity.current) < 0.001) {
        const quarter = Math.PI / 2;
        let a = currentAngle.current % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const nearestQuad = Math.round(a / quarter) * quarter;
        const springTarget = SPRING_CONFIG.tension * 0.8;
        currentAngle.current = damp(currentAngle.current, nearestQuad, springTarget, dt);
      } else {
        const targetAngle = isHovered ? 0.25 : 0;
        currentAngle.current = damp(currentAngle.current, targetAngle, ROTATION_DAMPING, dt);
      }
    }

    // Select view based on angle
    let a = currentAngle.current % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    const sector = Math.floor((a + Math.PI / 4) / (Math.PI / 2)) % 4;

    let activeTex = textures.front;
    let mirror = false;
    if (sector === 1) {
      activeTex = textures.side;
    } else if (sector === 2) {
      activeTex = textures.back;
    } else if (sector === 3) {
      activeTex = textures.side;
      mirror = true;
    }

    const mat = cardRef.current.material as THREE.MeshBasicMaterial;
    if (mat.map !== activeTex) {
      mat.map = activeTex;
      mat.needsUpdate = true;
    }

    // Mirror the side view via mesh scale X = -1 (matches reference). Mutating
    // texture.repeat.x/offset.x on the shared texture corrupts all caps.
    cardRef.current.scale.set(mirror ? -1 : 1, 1, 1);
    cardRef.current.rotation.y = currentAngle.current;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = currentAngle.current;
    prevClientX.current = e.clientX;
    angularVelocity.current = 0;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const deltaX = e.clientX - dragStartX.current;
    currentAngle.current = dragStartAngle.current + deltaX * 0.015;
    // Track velocity for momentum
    const deltaDelta = e.clientX - prevClientX.current;
    angularVelocity.current = -deltaDelta * 0.015 * 0.06;
    prevClientX.current = e.clientX;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    // Momentum continues via angularVelocity in useFrame
  };

  if (isOpened) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Chrome Hook: small wall plate below brim and thin rod angled up into crown (PDF spec) */}
      <mesh position={[0, -0.06, 0.02]} castShadow>
        <boxGeometry args={[0.03, 0.04, 0.006]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Angled display arm */}
      <mesh position={[0, -0.01, 0.07]} rotation={[0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.12, 16]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Crown support rounded tip */}
      <mesh position={[0, 0.03, 0.11]}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Cap Card */}
      <mesh
        ref={cardRef}
        position={[0, 0, 0.12]}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={() => {
          setIsHovered(false);
          setIsDragging(false);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        <planeGeometry args={[capW, capH]} />
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

export const CapsWall: React.FC = () => {
  const { inventory, selectedProduct, openProduct, brandSettings } = useStore();
  const caps = useMemo(
    () => inventory.filter((p) => p.category === 'caps').slice(0, 8),
    [inventory]
  );

  // Left wall: X = -3.45, faces inward: rotY = PI/2
  const wallX = -3.45;
  const colSpacing = 0.58; // 4 columns
  const rowSpacing = 0.55; // 2 rows

  return (
    <group position={[wallX, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
      {/* Birch Pegboard Backdrop */}
      <mesh position={[0, 0, -0.03]} receiveShadow>
        <boxGeometry args={[2.6, 1.5, 0.03]} />
        <meshStandardMaterial
          color={brandSettings.woodColor ? '#e8d8be' : '#e6d5bc'}
          roughness={0.7}
          metalness={0.02}
        />
      </mesh>

      {/* 2x4 Grid of Cap Hooks and Products */}
      {caps.map((product, index) => {
        const col = (index % 4) - 1.5; // -1.5, -0.5, 0.5, 1.5
        const row = Math.floor(index / 4) === 0 ? 0.32 : -0.28;

        const posX = col * colSpacing;
        const posY = row;

        return (
          <CapDisplayItem
            key={product.id}
            product={product}
            position={[posX, posY, 0]}
            isOpened={selectedProduct?.id === product.id}
            onOpen={() => openProduct(product)}
          />
        );
      })}

      {/* Overhead Section Spotlight */}
      <spotLight
        position={[0, 1.6, 1.4]}
        target-position={[0, 0, 0]}
        intensity={16}
        angle={0.65}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
};
