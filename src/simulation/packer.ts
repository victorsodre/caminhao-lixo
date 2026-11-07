export function safeProgress(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

const ease = (value: number) => { const t = safeProgress(value); return t * t * (3 - 2 * t); };

/** Four movements from McNeilus 1432584, fig. 25. Dimensions/timing are illustrative. */
export function samplePacker(value: number) {
  const p = safeProgress(value);
  const open = p < .25 ? ease(p * 4) : p < .5 ? 1 : p < .75 ? 1 - ease((p - .5) * 4) : 0;
  const slide = p < .25 ? 0 : p < .5 ? ease((p - .25) * 4) : p < .75 ? 1 : 1 - ease((p - .75) * 4);
  return { open, slide, transfer: ease((p - .5) * 2), stage: Math.min(3, Math.floor(p * 4)) };
}

export function packerGeometry(progress: number) {
  const pose = samplePacker(progress);
  return { x: 2.65 + .6 * pose.slide, y: 2.95 - .6 * pose.slide, angle: -.85 + 1.95 * pose.open };
}

export function advancePlayback(progress: number, deltaSeconds: number, playing: boolean, visible: boolean) {
  const p = safeProgress(progress);
  if (!playing || !visible) return p;
  const dt = Number.isFinite(deltaSeconds) ? Math.min(.1, Math.max(0, deltaSeconds)) : 0;
  return safeProgress(p + dt / 14);
}
