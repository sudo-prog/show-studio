/**
 * 3D Virtual Store math and animation utilities
 * Derived from the specifications in the build guide.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Standard GLSL smoothstep
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Ken Perlin's smootherstep (smoother acceleration and deceleration)
 */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Framerate-independent damping (matching THREE.MathUtils.damp)
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/**
 * Shortest signed distance between two angles in radians (-PI to PI)
 */
export function shortestAngleDiff(from: number, to: number): number {
  const diff = (to - from) % (Math.PI * 2);
  return ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
}

export type PhotoViewKey = 'front' | 'side' | 'back' | 'mirroredSide';

/**
 * Photo-turning garment card calculations:
 * - Angle normalized to 0..2PI
 * - Swap photos only in a narrow middle band (12% of the turn)
 * - Gradual width compression across the quarter turn
 * - Tilt up to 0.5 * offset in turn direction for 3D perspective
 */
export function getGarmentCardPose(angleRad: number): {
  view: PhotoViewKey;
  widthScale: number;
  tiltAngle: number;
  flipX: boolean;
} {
  // Normalize angle to [0, 2PI)
  let a = angleRad % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;

  // The 4 main quadrant targets:
  // 0 rad = Front
  // PI / 2 rad = Right Side
  // PI rad = Back
  // 3 * PI / 2 rad = Left Side (mirrored side)
  const quarter = Math.PI / 2;
  const sector = Math.floor((a + quarter / 2) / quarter) % 4;

  let view: PhotoViewKey = 'front';
  let flipX = false;

  if (sector === 0) {
    view = 'front';
  } else if (sector === 1) {
    view = 'side';
  } else if (sector === 2) {
    view = 'back';
  } else {
    view = 'mirroredSide';
    flipX = true;
  }

  // Calculate angle offset from the nearest main view
  const centerAngle = sector * quarter;
  const offset = shortestAngleDiff(centerAngle, a); // in [-PI/4, PI/4]
  const normalizedOffset = offset / (quarter / 2); // in [-1, 1]

  // Width scale: narrows as it turns away from broad view (smoothstep)
  // At center view (front or back), widthScale is 1.0; at 45 deg, it's ~0.65; at side, side photo is used.
  const absOffset = Math.abs(normalizedOffset);
  const widthScale = 1.0 - smoothstep(0, 1, absOffset) * 0.32;

  // Perspective tilt: up to ~0.5 * offset in turn direction, reaching 0 at swap
  // Tilt drops to zero at the extremes so it doesn't jarringly flip
  const tiltFactor = (1.0 - absOffset * absOffset) * normalizedOffset;
  const tiltAngle = tiltFactor * 0.25;

  return {
    view,
    widthScale,
    tiltAngle,
    flipX,
  };
}

/**
 * 4-view PhotoShoe calculation (outer, inner, toe, heel)
 */
export function getShoeViewKey(angleRad: number): {
  view: 'outer' | 'inner' | 'toe' | 'heel';
  widthScale: number;
  flipX: boolean;
} {
  let a = angleRad % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;

  // Outer side (0), Toe (PI/2), Inner side (PI), Heel (3*PI/2)
  const quarter = Math.PI / 2;
  const sector = Math.floor((a + quarter / 2) / quarter) % 4;

  if (sector === 0) return { view: 'outer', widthScale: 1.0, flipX: false };
  if (sector === 1) return { view: 'toe', widthScale: 0.85, flipX: false };
  if (sector === 2) return { view: 'inner', widthScale: 1.0, flipX: false };
  return { view: 'heel', widthScale: 0.85, flipX: false };
}

/**
 * Rack item slide layout:
 * Calculates horizontal offsets for rack garments when one garment is hovered
 */
export function calculateRackOffsets(
  totalItems: number,
  hoveredIndex: number | null,
  hoveredItemWidth: number = 0.62,
  sideSpacing: number = 0.22
): number[] {
  const offsets = new Array<number>(totalItems).fill(0);
  if (hoveredIndex === null || hoveredIndex < 0 || hoveredIndex >= totalItems) {
    return offsets;
  }

  const pushDistance = hoveredItemWidth * 0.5 + 0.12; // as per PDF spec: half width + 0.12m

  for (let i = 0; i < totalItems; i++) {
    if (i < hoveredIndex) {
      // Items to the left slide further left
      const distanceDecay = Math.max(0.3, 1 - (hoveredIndex - i - 1) * 0.2);
      offsets[i] = -pushDistance * distanceDecay;
    } else if (i > hoveredIndex) {
      // Items to the right slide right
      const distanceDecay = Math.max(0.3, 1 - (i - hoveredIndex - 1) * 0.2);
      offsets[i] = pushDistance * distanceDecay;
    } else {
      offsets[i] = 0;
    }
  }

  return offsets;
}
