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
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0.25, 0.6], fov: 55 }}
        shadows
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onCreated={(state) => {
          // three.js r186 removed PCFSoftShadowMap; R3F defaults to it when
          // shadows is true, producing a console warning. Explicitly set
          // PCFShadowMap to suppress it.
          state.gl.shadowMap.type = THREE.PCFShadowMap;
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
