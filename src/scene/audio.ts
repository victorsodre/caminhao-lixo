/** Gentle synthesized cue, not a recording of a real vehicle. Created only after a user gesture. */
export function createAudio() {
  const context = new AudioContext(), oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = 'triangle'; oscillator.frequency.value = 70;
  gain.gain.value = 0; oscillator.connect(gain); gain.connect(context.destination); oscillator.start();
  return {
    set(active: boolean, phase: number) {
      if (context.state === 'closed') return;
      oscillator.frequency.setTargetAtTime(65 + phase * 11, context.currentTime, .2);
      gain.gain.setTargetAtTime(active ? .018 : 0, context.currentTime, .12);
    },
    async resume() { if (context.state === 'suspended') await context.resume(); },
    dispose() { oscillator.stop(); void context.close(); },
  };
}
