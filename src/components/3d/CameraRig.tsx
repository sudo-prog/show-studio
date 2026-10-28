import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { SECTIONS } from '../../data/sections';
import {
  damp,
  clamp,
  OVERVIEW_DAMPING,
  SECTION_DAMPING,
  SPRING_CONFIG,
} from '../../utils/math3d';

// Velocity decay factor for momentum (per second)
const MOMENTUM_DECAY = 5.5;

export const CameraRig: React.FC = () => {
  const { activeSection, setActiveSection, selectedProduct } = useStore();
  const { camera, size, gl } = useThree();

  // Overview rotation angles (yaw, pitch)
  const yaw = useRef<number>(0);
  const pitch = useRef<number>(0);

  // Momentum: angular velocity from drag release
  const yawVelocity = useRef<number>(0);
  const pitchVelocity = useRef<number>(0);

  // Section panning offset along rail/wall tangent
  const panX = useRef<number>(0);
  const panVelocity = useRef<number>(0);
  const zoomLevel = useRef<number>(1.0);

  // Drag interaction tracking
  const isPointerDown = useRef<boolean>(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startYaw = useRef<number>(0);
  const startPitch = useRef<number>(0);
  const startPanX = useRef<number>(0);

  // Momentum tracking during drag
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
      // Kill any existing momentum
      yawVelocity.current = 0;
      pitchVelocity.current = 0;
      panVelocity.current = 0;
      // Track mouse for velocity calculation
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return;
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;

      // Track velocity for momentum (pixels per frame, normalized)
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      if (activeSection === 'store') {
        // Overview: drag rotates yaw & pitch
        yaw.current = startYaw.current - dx * 0.005;
        pitch.current = clamp(startPitch.current + dy * 0.003, -0.45, 0.45);

        // Accumulate velocity for momentum (scaled: negative because drag direction is opposite to desired velocity)
        yawVelocity.current = -deltaX * 0.004;
        pitchVelocity.current = deltaY * 0.0025;
      } else {
        // Section: drag slides along tangent
        panX.current = clamp(startPanX.current - dx * 0.0035, -1.2, 1.2);

        // Accumulate velocity for momentum
        panVelocity.current = -deltaX * 0.003;
      }
    };

    const onPointerUp = () => {
      isPointerDown.current = false;
      // Velocity is already tracked from last move; momentum continues via useFrame
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
    yawVelocity.current = 0;
    pitchVelocity.current = 0;
    panVelocity.current = 0;
  }, [activeSection]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const aspect = size.width / size.height;

    if (activeSection === 'store') {
      // ----------------- OVERVIEW RIG -----------------
      targetPos.current.set(0, 0.25, 0.6);

      // Apply momentum: continue rotating after drag release
      if (!isPointerDown.current) {
        yaw.current += yawVelocity.current * dt;
        pitch.current += pitchVelocity.current * dt;

        // Clamp pitch
        pitch.current = clamp(pitch.current, -0.45, 0.45);

        // Decay momentum
        yawVelocity.current *= Math.exp(-MOMENTUM_DECAY * dt);
        pitchVelocity.current *= Math.exp(-MOMENTUM_DECAY * dt);

        // Stop when velocity is negligible
        if (Math.abs(yawVelocity.current) < 0.0005) yawVelocity.current = 0;
        if (Math.abs(pitchVelocity.current) < 0.0005) pitchVelocity.current = 0;
      }

      const lookDist = 4.0;
      const cosP = Math.cos(pitch.current);
      const lookX = -Math.sin(yaw.current) * cosP * lookDist;
      const lookY = 0.35 + Math.sin(pitch.current) * lookDist;
      const lookZ = -Math.cos(yaw.current) * cosP * lookDist;

      targetLook.current.set(lookX, lookY, lookZ);

      // Damp camera position and look target
      camera.position.x = damp(camera.position.x, targetPos.current.x, OVERVIEW_DAMPING * 6, dt);
      camera.position.y = damp(camera.position.y, targetPos.current.y, OVERVIEW_DAMPING * 6, dt);
      camera.position.z = damp(camera.position.z, targetPos.current.z, OVERVIEW_DAMPING * 6, dt);

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

      // Apply momentum to section pan
      if (!isPointerDown.current) {
        panX.current += panVelocity.current * dt;

        // Decelerate momentum
        panVelocity.current *= Math.exp(-MOMENTUM_DECAY * dt);

        // Snap-back: spring back to center (0) when momentum dies
        // Use SPRING_CONFIG for spring snap-back behavior
        const snapBackForce = -panX.current * SPRING_CONFIG.tension * 2;
        panVelocity.current += snapBackForce * dt;

        // Stop when negligible
        if (Math.abs(panVelocity.current) < 0.0001) {
          panVelocity.current = 0;
          panX.current = damp(panX.current, 0, 4.0, dt);
        }

        // Clamp within bounds
        panX.current = clamp(panX.current, -1.2, 1.2);
      }

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

      // Smooth damping using SECTION_DAMPING
      camera.position.x = damp(camera.position.x, targetPos.current.x, SECTION_DAMPING * 8, dt);
      camera.position.y = damp(camera.position.y, targetPos.current.y, SECTION_DAMPING * 8, dt);
      camera.position.z = damp(camera.position.z, targetPos.current.z, SECTION_DAMPING * 8, dt);

      currentLook.current.x = damp(currentLook.current.x, targetLook.current.x, SECTION_DAMPING * 8, dt);
      currentLook.current.y = damp(currentLook.current.y, targetLook.current.y, SECTION_DAMPING * 8, dt);
      currentLook.current.z = damp(currentLook.current.z, targetLook.current.z, SECTION_DAMPING * 8, dt);

      camera.lookAt(currentLook.current);
    }
  });

  return null;
};
