export type MicroFeedbackOptions = {
  volume?: number; // 0..1
  durationMs?: number;
  frequencyHz?: number;
  vibratePattern?: number | number[];
};

export const microFeedback = (opts: MicroFeedbackOptions = {}) => {
  const {
    volume = 0.025,
    durationMs = 40,
    frequencyHz = 680,
    vibratePattern = 18,
  } = opts;

  // Haptics (mobile)
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      (navigator as any).vibrate(vibratePattern);
    }
  } catch {
    // ignore
  }

  // Sound (lightweight WebAudio click)
  try {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequencyHz;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);

    osc.onended = () => {
      ctx.close().catch(() => undefined);
    };
  } catch {
    // ignore
  }
};
