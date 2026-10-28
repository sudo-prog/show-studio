import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { SECTIONS } from '../../data/sections';
import { damp, clamp } from '../../utils/math3d';

export const CameraRig: React.FC = () => {
  const { activeSection, setActiveSection, selectedProduct } = useStore();
  const { camera, size, gl } = useThree();

  // Overview rotation angles (yaw, pitch)
  const yaw = useRef<number>(0);
  const pitch = useRef<number>(0);

  // Section panning offset along rail/wall tangent
  const panX = useRef<number>(0);
  const zoomLevel = useRef<number>(1.0);

  // Drag interaction tracking
  const isPointerDown = useRef<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startYaw = useRef<number>(0);
  const startPitch = useRef<number>(0);
  const startPanX = useRef<number>(0);

  // Camera animation target states
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.25, 0.6));
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.25, -2));
  const currentLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.25, -2));

  // Pointer event listeners on canvas domElement
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag camera if pointer is over a button or interactive product
      isPointerDown.current = true;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      startYaw.current = yaw.current;
      startPitch.current = pitch.current;
      startPanX.current = panX.current;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return;
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;

      if (activeSection === 'store') {
        // Overview: drag rotates yaw & pitch
        yaw.current = startYaw.current - dx * 0.005;
        pitch.current = clamp(startPitch.current + dy * 0.003, -0.45, 0.45);
      } else {
        // Section: drag slides along tangent
        panX.current = clamp(startPanX.current - dx * 0.0035, -1.2, 1.2);
      }
    };

    const onPointerUp = () => {
      isPointerDown.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (selectedProduct) return;
      zoomLevel.current = clamp(zoomLevel.current + e.deltaY * 0.001, 0.8, 1.3);
    };

    // Double-click returns to overview (Build Prompt 4)
    const onDblClick = () => {
      if (activeSection !== 'store') {
        setActiveSection('store');
      }
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });
    dom.addEventListener('dblclick', onDblClick);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('dblclick', onDblClick);
    };
  }, [gl, activeSection, selectedProduct, setActiveSection]);

  // When changing section, reset pan offset
  useEffect(() => {
    panX.current = 0;
    zoomLevel.current = 1.0;
  }, [activeSection]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const aspect = size.width / size.height;

    if (activeSection === 'store') {
      // ----------------- OVERVIEW RIG -----------------
      targetPos.current.set(0, 0.25, 0.6);

      const lookDist = 4.0;
      const cosP = Math.cos(pitch.current);
      const lookX = -Math.sin(yaw.current) * cosP * lookDist;
      const lookY = 0.35 + Math.sin(pitch.current) * lookDist;
      const lookZ = -Math.cos(yaw.current) * cosP * lookDist;

      targetLook.current.set(lookX, lookY, lookZ);

      // Damp camera position and look target
      camera.position.x = damp(camera.position.x, targetPos.current.x, 3.8, dt);
      camera.position.y = damp(camera.position.y, targetPos.current.y, 3.8, dt);
      camera.position.z = damp(camera.position.z, targetPos.current.z, 3.8, dt);

      currentLook.current.x = damp(currentLook.current.x, targetLook.current.x, 5.0, dt);
      currentLook.current.y = damp(currentLook.current.y, targetLook.current.y, 5.0, dt);
      currentLook.current.z = damp(currentLook.current.z, targetLook.current.z, 5.0, dt);

      camera.lookAt(currentLook.current);
    } else {
      // ----------------- SECTION RIG -----------------
      const sec = SECTIONS[activeSection];
      const rotY = sec.rotationY;

      // Wall normal and tangent vectors
      const normal = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY));
      const tangent = new THREE.Vector3(-Math.cos(rotY), 0, Math.sin(rotY));

      // Distance to fit display width on screen
      const fovRad = THREE.MathUtils.degToRad(38);
      const halfTan = Math.tan(fovRad / 2);
      const fitDistance = (sec.fitWidth / 2 / (halfTan * Math.max(aspect, 0.85))) * zoomLevel.current;
      const clampedDist = clamp(fitDistance, 2.0, 4.2);

      // Center look target with pan along tangent
      const originVec = new THREE.Vector3(...sec.origin);
      const lookPoint = originVec
        .clone()
        .add(tangent.clone().multiplyScalar(panX.current));
      lookPoint.y = sec.lookY;

      targetLook.current.copy(lookPoint);

      // Camera sits along the normal from the display
      const camPos = lookPoint
        .clone()
        .add(normal.clone().multiplyScalar(clampedDist));
      camPos.y = clamp(sec.lookY + 0.15, -0.4, 1.8);

      targetPos.current.copy(camPos);

      // Smooth damping
      camera.position.x = damp(camera.position.x, targetPos.current.x, 3.8, dt);
      camera.position.y = damp(camera.position.y, targetPos.current.y, 3.8, dt);
      camera.position.z = damp(camera.position.z, targetPos.current.z, 3.8, dt);

      currentLook.current.x = damp(currentLook.current.x, targetLook.current.x, 5.0, dt);
      currentLook.current.y = damp(currentLook.current.y, targetLook.current.y, 5.0, dt);
      currentLook.current.z = damp(currentLook.current.z, targetLook.current.z, 5.0, dt);

      camera.lookAt(currentLook.current);
    }
  });

  return null;
};
