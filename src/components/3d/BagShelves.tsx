import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { damp, clamp, POSITION_DAMPING, ROTATION_DAMPING, SPRING_CONFIG } from '../../utils/math3d';
import { getTextureUrl } from '../../utils/textures';

interface BagDisplayItemProps {
  product: Product;
  position: [number, number, number];
  isCrossbody: boolean;
  isOpened: boolean;
  onOpen: () => void;
}

const BagDisplayItem: React.FC<BagDisplayItemProps> = ({
  product,
  position,
  isCrossbody,
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

  const currentAngle = useRef<number>(0);
  const currentLift = useRef<number>(0);

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    // Clone each loaded texture so per-bag repeat/offset (mirror) state is isolated.
    // Mutating the shared texture (loader.load cache) corrupts EVERY bag that uses
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

  const shadowTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 56);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const bagW = product.views.front.size[0] * 0.55;
  const bagH = product.views.front.size[1] * 0.55;

  useFrame((_, delta) => {
    if (!groupRef.current || !cardRef.current) return;
    const dt = Math.min(delta, 0.05);

    const targetLift = isHovered || isDragging ? 0.04 : 0;
    currentLift.current = damp(currentLift.current, targetLift, POSITION_DAMPING, dt);
    cardRef.current.position.y = (isCrossbody ? -bagH * 0.45 : bagH * 0.45) + currentLift.current;

    if (shadowRef.current && !isCrossbody) {
      const shadowMat = shadowRef.current.material as THREE.MeshBasicMaterial;
      shadowMat.opacity = damp(shadowMat.opacity, isHovered ? 0.15 : 0.4, POSITION_DAMPING, dt);
    }

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
        const targetAngle = isHovered ? 0.3 : 0;
        currentAngle.current = damp(currentAngle.current, targetAngle, ROTATION_DAMPING, dt);
      }
    }

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
    // texture.repeat.x/offset.x on the shared texture corrupts all bags.
    const bagWm = bagW * (mirror ? -1 : 1);
    cardRef.current.scale.set(bagWm / bagW, 1, 1);
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
    // Track velocity for momentum (pixels per frame → angular velocity)
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
      {/* Contact Shadow for standing bags */}
      {!isCrossbody && (
        <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <planeGeometry args={[bagW * 1.1, 0.28]} />
          <meshBasicMaterial map={shadowTex} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}

      {/* Wall Hook for Crossbody Bags (hung from strap apex) */}
      {isCrossbody && (
        <group position={[0, 0, -0.02]}>
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.05, 16]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.015, 0.045]}>
            <sphereGeometry args={[0.01, 16, 16]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      )}

      {/* Bag Card */}
      <mesh
        ref={cardRef}
        position={[0, isCrossbody ? -bagH * 0.45 : bagH * 0.45, 0.06]}
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
        <planeGeometry args={[bagW, bagH]} />
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

export const BagShelves: React.FC = () => {
  const { inventory, selectedProduct, openProduct, brandSettings } = useStore();

  const crossbodies = useMemo(
    () => inventory.filter((p) => p.productType === 'bag-crossbody')
      .sort((a, b) => {
        const colorA = (a as any).color || '';
        const colorB = (b as any).color || '';
        const aIsPink = colorA.toLowerCase().includes('rose') || colorA.toLowerCase().includes('pink') || a.name.toLowerCase().includes('rose') || a.name.toLowerCase().includes('pink');
        const bIsPink = colorB.toLowerCase().includes('rose') || colorB.toLowerCase().includes('pink') || b.name.toLowerCase().includes('rose') || b.name.toLowerCase().includes('pink');
        if (aIsPink && !bIsPink) return -1;
        if (!aIsPink && bIsPink) return 1;
        return 0;
      })
      .slice(0, 2),
    [inventory]
  );
  const standingBags = useMemo(
    () => inventory.filter((p) => p.productType === 'bag-standing').slice(0, 6),
    [inventory]
  );

  // Front wall: Z = 3.45, rotationY = Math.PI
  const wallZ = 3.45;

  return (
    <group position={[0, 0.25, wallZ]} rotation={[0, Math.PI, 0]}>
      {/* Warm fill light for bags wall */}
      <directionalLight position={[0, 2, -1]} intensity={0.3} color="#fafafa" />
      {/* 4 Crossbody Bags on Wall Hooks above the cubby unit */}
      <group position={[0, 1.05, 0]}>
        {crossbodies.map((product, idx) => {
          const x = (idx - 0.5) * 0.85;
          return (
            <BagDisplayItem
              key={product.id}
              product={product}
              position={[x, 0, 0]}
              isCrossbody={true}
              isOpened={selectedProduct?.id === product.id}
              onOpen={() => openProduct(product)}
            />
          );
        })}
      </group>

      {/* 6 Standing Bags on a 3D Platform with Depth */}
      <group position={[0, -1.43, 0.25]}>
        {/* Dark brown back panel behind everything */}
        <mesh position={[0, 0.30, 0.0]} receiveShadow>
          <boxGeometry args={[2.4, 2.5, 0.04]} />
          <meshStandardMaterial color="#8a6a48" roughness={0.9} />
        </mesh>

        {/* Back panel (dark recess behind the unit) */}
        <mesh position={[0, 0.30, 0.1]} receiveShadow>
          <boxGeometry args={[2.4, 2.5, 0.05]} />
          <meshStandardMaterial color="#8a6a48" roughness={0.9} />
        </mesh>

        {/* Shelf slabs - 3 horizontal shelves at local y = -0.9, -0.1, 0.7 (cells 0.8 tall) */}
        {[-0.9, -0.1, 0.7].map((rowY, i) => (
          <mesh position={[0, rowY, 0.16]} key={i}>
            <boxGeometry args={[2.4, 0.20, 0.45]} />
            <meshStandardMaterial color="#d4b890" roughness={0.7} />
          </mesh>
        ))}

        {/* Vertical dividers - 3 at x = -0.8, 0, 0.8 (2 columns of 0.8 width), centred at y = -0.5 spanning both rows */}
        {[-0.8, 0, 0.8].map((divX, i) => (
          <mesh position={[divX, -0.5, 0.16]} key={`div-${i}`}>
            <boxGeometry args={[0.24, 2.8, 0.45]} />
            <meshStandardMaterial color="#d4b890" roughness={0.7} />
          </mesh>
        ))}

        {/* Side frame - vertical tan posts at x = ±1.2 for outer edges */}
        {[-1.2, 1.2].map((sideX, i) => (
          <mesh position={[sideX, -0.5, 0.16]} key={`side-${i}`}>
            <boxGeometry args={[0.24, 2.8, 0.45]} />
            <meshStandardMaterial color="#d4b890" roughness={0.7} />
          </mesh>
        ))}

        {/* 6 Standing Bags in cubby niches with 2-column grid, positions: col ±0.4, rows at y=0.35 and y=-0.45 */}
        {standingBags.map((product, idx) => {
          const col = (idx % 2) - 0.5; // -0.5, 0.5 → columns at x = ±0.4
          const row = [0.3, -0.5][Math.floor(idx / 2)]; // cell centres: top row 0.3, bottom row -0.5
          const cubbyX = col * 0.75; // columns at x = ±0.375
          const bagW = product.views.front.size[0];

          return (
            <group key={product.id} position={[cubbyX, row, 0.22]} scale={0.95}>
              {/* Standing Product inside cubby */}
              <BagDisplayItem
                product={product}
                position={[0, -0.04, 0.04]}
                isCrossbody={false}
                isOpened={selectedProduct?.id === product.id}
                onOpen={() => openProduct(product)}
              />
            </group>
          );
        })}
      </group>
      <spotLight
        position={[0, 1.8, 1.4]}
        target-position={[0, 0.2, 0]}
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
