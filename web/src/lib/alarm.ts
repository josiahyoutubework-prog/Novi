// A synthesised alarm tone (Web Audio) — no audio file, matching Novi's
// asset-free design. Start it when the challenge fires, stop it when done.
let ctx: AudioContext | null = null;
let timer: number | null = null;

function beep() {
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(660, now + 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.36);
}

export function startAlarm() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (timer != null) return;
    beep();
    timer = window.setInterval(beep, 700);
  } catch { /* audio blocked — the visual alarm still works */ }
}

export function stopAlarm() {
  if (timer != null) { window.clearInterval(timer); timer = null; }
}
