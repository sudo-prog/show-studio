import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { damp, getShoeViewKey, clamp, POSITION_DAMPING, ROTATION_DAMPING, SPRING_CONFIG } from '../../utils/math3d';
import { getTextureUrl } from '../../utils/textures';

interface ShoeDisplayItemProps {
  product: Product;
  position: [number, number, number];
  isOpened: boolean;
  onOpen: () => void;
}

const ShoeDisplayItem: React.FC<ShoeDisplayItemProps> = ({
  product,
  position,
  isOpened,
  onOpen,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const angularVelocity = useRef(0);
  const prevClientX = useRef(0);

  const currentAngle = useRef<number>(0); // 0 rad = outer side, toe right
  const currentLift = useRef<number>(0);

  // Load 4 textures (outer, inner, toe, heel)
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const outer = loader.load(getTextureUrl(product.category, product.id, 'outer'));
    const inner = loader.load(getTextureUrl(product.category, product.id, 'inner'));
    const toe = loader.load(getTextureUrl(product.category, product.id, 'toe'));
    const heel = loader.load(getTextureUrl(product.category, product.id, 'heel'));

    [outer, inner, toe, heel].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      // NPOT textures cannot have mipmaps in WebGL — LinearMipmapLinearFilter
      // produces diagonal grid artifacts on this hardware.
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
    });

    return { outer, inner, toe, heel };
  }, [product]);

  // Soft contact shadow texture
  const shadowTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 56);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !cardRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Lift when hovered or dragging
    const targetLift = isHovered || isDragging ? 0.05 : 0;
    currentLift.current = damp(currentLift.current, targetLift, POSITION_DAMPING, dt);
    cardRef.current.position.y = 0.08 + currentLift.current;

    // Contact shadow fades and expands when lifted
    if (shadowRef.current) {
      const shadowMat = shadowRef.current.material as THREE.MeshBasicMaterial;
      shadowMat.opacity = damp(shadowMat.opacity, isHovered ? 0.18 : 0.45, POSITION_DAMPING, dt);
      const sScale = damp(shadowRef.current.scale.x, isHovered ? 1.15 : 1.0, POSITION_DAMPING, dt);
      shadowRef.current.scale.set(sScale, sScale, 1);
    }

    // Gentle hover rotation if not actively dragging
    if (!isDragging) {
      // Apply momentum with decay after release
      angularVelocity.current *= Math.exp(-6.0 * dt);
      currentAngle.current += angularVelocity.current * dt;

      // If no significant momentum, spring snap to nearest quadrant (outer=0, toe=PI/2, inner=PI, heel=3*PI/2)
      if (Math.abs(angularVelocity.current) < 0.001) {
        const quarter = Math.PI / 2;
        // Normalize to [0, 2PI)
        let a = currentAngle.current % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        // Find nearest quadrant center
        const nearestQuad = Math.round(a / quarter) * quarter;
        // Spring snap-back to nearest quadrant using SPRING_CONFIG
        const springTarget = SPRING_CONFIG.tension * 0.8;
        currentAngle.current = damp(currentAngle.current, nearestQuad, springTarget, dt);
      } else {
        // While momentum is still active, apply gentle hover pull
        const targetAngle = isHovered ? 0.35 : 0;
        currentAngle.current = damp(currentAngle.current, targetAngle, ROTATION_DAMPING, dt);
      }
    }

    // Determine active 4-quadrant photo texture
    const shoePose = getShoeViewKey(currentAngle.current);
    let activeTex = textures.outer;
    if (shoePose.view === 'inner') activeTex = textures.inner;
    else if (shoePose.view === 'toe') activeTex = textures.toe;
    else if (shoePose.view === 'heel') activeTex = textures.heel;

    const mat = cardRef.current.material as THREE.MeshBasicMaterial;
    if (mat.map !== activeTex) {
      mat.map = activeTex;
      mat.needsUpdate = true;
    }

    // Apply scale and card angle
    cardRef.current.scale.set(shoePose.widthScale, 1, 1);
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
      {/* Contact Shadow blob on shelf */}
      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
      >
        <planeGeometry args={[0.34, 0.14]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Shoe Card */}
      <mesh
        ref={cardRef}
        position={[0, 0.08, 0]}
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
        <planeGeometry args={[0.3, 0.18]} />
        <meshBasicMaterial
          map={textures.outer}
          transparent
          alphaTest={0.02}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export const ShoeWall: React.FC = () => {
  const { inventory, selectedProduct, openProduct, brandSettings } = useStore();
  const shoes = useMemo(
    () => inventory.filter((p) => p.category === 'shoes').slice(0, 9),
    [inventory]
  );

  // Wall position & rotation (Right wall: X = 3.48, faces inward: rotY = -PI/2)
  const wallX = 3.45;
  const colSpacing = 0.72; // horizontal shelf distance
  const rowSpacing = 0.52; // vertical shelf distance

  return (
    <group position={[wallX, 0.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Warm Oak Backdrop Panel */}
      <mesh position={[0, 0.2, -0.06]} receiveShadow>
        <boxGeometry args={[2.7, 2.1, 0.05]} />
        <meshStandardMaterial
          color={brandSettings.woodColor || '#b58c5c'}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* 3x3 Grid of Shelves & Shoes */}
      {shoes.map((product, index) => {
        const col = (index % 3) - 1; // -1, 0, 1
        const row = 1 - Math.floor(index / 3); // 1, 0, -1

        const shelfX = col * colSpacing;
        const shelfY = row * rowSpacing;

        return (
          <group key={product.id} position={[shelfX, shelfY, 0]}>
            {/* White floating shelf with bevelled edge */}
            <mesh position={[0, -0.015, 0.08]} castShadow receiveShadow>
              <boxGeometry args={[0.54, 0.026, 0.28]} />
              <meshStandardMaterial color="#f9fafb" roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Shelf metal concealed bracket accents */}
            <mesh position={[-0.18, -0.035, 0.02]}>
              <boxGeometry args={[0.02, 0.02, 0.12]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.18, -0.035, 0.02]}>
              <boxGeometry args={[0.02, 0.02, 0.12]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Shoe Item */}
            <ShoeDisplayItem
              product={product}
              position={[0, 0, 0.08]}
              isOpened={selectedProduct?.id === product.id}
              onOpen={() => openProduct(product)}
            />
          </group>
        );
      })}

      {/* Overhead Section Spotlight */}
      <spotLight
        position={[0, 1.8, 1.5]}
        target-position={[0, 0.2, 0]}
        intensity={18}
        angle={0.6}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
};
