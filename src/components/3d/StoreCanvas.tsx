import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { RoomScene } from './RoomScene';
import { ClothingRack } from './ClothingRack';
import { ShoeWall } from './ShoeWall';
import { CapsWall } from './CapsWall';
import { BagShelves } from './BagShelves';
import { useStore } from '../../context/StoreContext';

export const StoreCanvas: React.FC = () => {
  const { brandSettings } = useStore();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none">
      <Canvas
        camera={{ position: [0, 0.35, 2.8], fov: 42 }}
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.NoToneMapping,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <RoomScene />
          <ClothingRack />
          <ShoeWall />
          <CapsWall />
          <BagShelves />
        </Suspense>
      </Canvas>
    </div>
  );
};
