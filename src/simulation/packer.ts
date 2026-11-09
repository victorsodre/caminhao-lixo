export function safeProgress(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

const ease = (value: number) => { const t = safeProgress(value); return t * t * (3 - 2 * t); };

/** Seconds per cycle at normal speed. Illustrative, not a measured cycle time. */
export const CYCLE_SECONDS = 14;

/**
 * Four movements from McNeilus 1432584, sec. 3.6 / fig. 25. Dimensions and timing are illustrative.
 * `gather` is the sweep pulling the hopper load forward; `pack` is the slide pushing it into the body.
 */
export function samplePacker(value: number) {
  const p = safeProgress(value);
  const open = p < .25 ? ease(p * 4) : p < .5 ? 1 : p < .75 ? 1 - ease((p - .5) * 4) : 0;
  const slide = p < .25 ? 0 : p < .5 ? ease((p - .25) * 4) : p < .75 ? 1 : 1 - ease((p - .75) * 4);
  return { open, slide, gather: ease((p - .5) * 4), pack: ease((p - .75) * 4), stage: Math.min(3, Math.floor(p * 4)) };
}

export function packerGeometry(progress: number) {
  const pose = samplePacker(progress);
  return { x: 2.65 + .6 * pose.slide, y: 2.95 - .6 * pose.slide, angle: -.85 + 1.95 * pose.open };
}

export function advancePlayback(progress: number, deltaSeconds: number, playing: boolean, visible: boolean, speed = 1) {
  const p = safeProgress(progress);
  if (!playing || !visible) return p;
  const dt = Number.isFinite(deltaSeconds) ? Math.min(.1, Math.max(0, deltaSeconds)) : 0;
  const rate = Number.isFinite(speed) ? Math.max(0, speed) : 1;
  return safeProgress(p + dt * rate / CYCLE_SECONDS);
}

/**
 * Collection body interior, in model units. The ejector face starts at the rear (empty body)
 * and retracts toward the front as packed layers accumulate (McNeilus 1432584, sec. 2.6).
 */
export const BODY = { rear: 1.62, ejectorHome: -1.54, floor: 1.41, top: 3.46, halfWidth: 1.05 } as const;

/** Envelope of the loose load drawn in the hopper (bags with air between them). */
export const HOPPER_LOAD = { minX: 2.78, maxX: 4.22, minY: 1.15, maxY: 1.9, halfWidth: .85 } as const;

/**
 * Illustrative capacity: how many hopper loads fill this model's body. Chosen so that each loose load
 * becomes a layer about 4× smaller, the "até quatro vezes" cited in EP145 (Brasil do Trecho, 12/01/2026).
 */
export const CYCLES_TO_FILL = 28;

const bodyLength = BODY.rear - BODY.ejectorHome;
const bodySection = (BODY.top - BODY.floor) * BODY.halfWidth * 2;
/** Thickness of one packed layer. */
export const LAYER = bodyLength / CYCLES_TO_FILL;

/** Loose hopper volume divided by the packed layer volume, as drawn in this model. */
export function modelCompaction() {
  const loose = (HOPPER_LOAD.maxX - HOPPER_LOAD.minX) * (HOPPER_LOAD.maxY - HOPPER_LOAD.minY) * HOPPER_LOAD.halfWidth * 2;
  return loose / (LAYER * bodySection);
}

export function safeLoads(value: number) {
  return Number.isFinite(value) ? Math.min(CYCLES_TO_FILL, Math.max(0, Math.floor(value))) : 0;
}

export const isFull = (loads: number) => safeLoads(loads) >= CYCLES_TO_FILL;

/** Fraction of the body occupied by packed refuse, including the layer being packed now. */
export function bodyFill(loads: number, progress: number) {
  const done = safeLoads(loads);
  if (done >= CYCLES_TO_FILL) return 1;
  return (done + samplePacker(progress).pack) / CYCLES_TO_FILL;
}

/** Ejector face position: pushed forward by the packed mass. */
export const ejectorFace = (loads: number, progress: number) => BODY.rear - bodyLength * bodyFill(loads, progress);

export type CycleState = { progress: number; loads: number };

/**
 * Advances the packing cycle. At the end of a cycle the packed layer stays in the body (loads + 1)
 * and the mechanism returns to its rest pose with a new load in the hopper. `stopAt` halts mid-cycle
 * (guided tour). A full body never gains another layer.
 */
export function advanceCycle(state: CycleState, deltaSeconds: number, speed = 1, stopAt = 1): CycleState {
  const loads = safeLoads(state.loads), limit = safeProgress(stopAt);
  const next = advancePlayback(state.progress, deltaSeconds, true, true, speed);
  if (limit < 1 && next >= limit) return { progress: Math.max(safeProgress(state.progress), limit), loads };
  if (next < 1) return { progress: next, loads };
  // A full body has no room for another layer: the mechanism just rests at the end.
  if (loads >= CYCLES_TO_FILL) return state.progress === 1 && state.loads === loads ? state : { progress: 1, loads };
  return { progress: 0, loads: loads + 1 };
}
