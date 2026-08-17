import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { startAlarm, stopAlarm } from '../lib/alarm';

// The full-screen morning challenge. It will NOT dismiss until you complete
// the pushup goal — counted by tapping the screen (phone on the floor, tap
// with your nose/chin at the bottom of each rep) or by phone motion.
export default function AlarmChallenge() {
  const active = useStore((s) => s.alarmActive);
  const kind = useStore((s) => s.alarmKind);
  const fitness = useStore((s) => s.fitness);
  const dismissAlarm = useStore((s) => s.dismissAlarm);
  const completeChallenge = useStore((s) => s.completeChallenge);

  const goal = fitness?.settings.pushupGoal ?? 20;
  const soundOn = fitness?.settings.soundOn ?? true;
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [motionOn, setMotionOn] = useState(false);
  const [motionErr, setMotionErr] = useState('');
  const countRef = useRef(0);
  const lastRepAt = useRef(0);
  const primed = useRef(false); // motion: saw the "down" before counting an "up"

  // Sound on while active + unfinished.
  useEffect(() => {
    if (active && soundOn && !done) startAlarm();
    return () => stopAlarm();
  }, [active, soundOn, done]);

  // Reset when a new alarm opens.
  useEffect(() => {
    if (active) { setCount(0); setDone(false); setMotionOn(false); setMotionErr(''); countRef.current = 0; primed.current = false; }
  }, [active]);

  const bump = () => {
    if (done) return;
    const next = countRef.current + 1;
    countRef.current = next;
    setCount(next);
    if (navigator.vibrate) navigator.vibrate(30);
    if (next >= goal) finish(next);
  };

  const finish = async (reps: number) => {
    setDone(true);
    stopAlarm();
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    try { await completeChallenge(reps, kind); } catch { /* keep the celebration regardless */ }
    setTimeout(() => dismissAlarm(), 1800);
  };

  // Motion counting — one rep per down→up cycle of the phone.
  useEffect(() => {
    if (!motionOn) return;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const now = Date.now();
      if (mag < 6) primed.current = true; // near the bottom of a pushup (phone near still/inverted)
      if (primed.current && mag > 13 && now - lastRepAt.current > 500) {
        primed.current = false;
        lastRepAt.current = now;
        bump();
      }
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOn, done]);

  const enableMotion = async () => {
    try {
      const D = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
      if (D && typeof D.requestPermission === 'function') {
        const perm = await D.requestPermission();
        if (perm !== 'granted') { setMotionErr('Motion permission denied — tap to count instead.'); return; }
      }
      setMotionOn(true);
    } catch {
      setMotionErr('Motion isn’t available here — tap to count instead.');
    }
  };

  if (!active) return null;

  const pct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <div
      onClick={done ? undefined : bump}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, cursor: done ? 'default' : 'pointer',
        background: done ? 'oklch(0.55 0.10 155)' : 'oklch(0.5 0.13 255)', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 28, userSelect: 'none', WebkitUserSelect: 'none',
        transition: 'background .4s ease',
      }}
    >
      {done ? (
        <div className="rise">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em' }}>DONE</div>
          <div style={{ marginTop: 18, fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em' }}>Nice work.</div>
          <div style={{ marginTop: 12, fontSize: 18, opacity: 0.9 }}>{goal} pushups before anything else.</div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em', opacity: 0.85 }}>
            {kind === 'now' ? 'PUSHUP CHALLENGE' : 'TIME TO MOVE'}
          </div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 500 }}>Do {goal} pushups to turn this off.</div>

          <div style={{ marginTop: 40, fontSize: 108, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {count}<span style={{ fontSize: 40, opacity: 0.7 }}> / {goal}</span>
          </div>

          <div style={{ marginTop: 28, width: 'min(340px, 80vw)', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#fff', transition: 'width .15s' }} />
          </div>

          <div style={{ marginTop: 40, fontSize: 16, opacity: 0.9, maxWidth: 320, lineHeight: 1.5 }}>
            {motionOn
              ? 'Counting your motion. Go — one rep at a time.'
              : 'Put your phone on the floor and tap the screen with your nose or chin at the bottom of each pushup.'}
          </div>

          {!motionOn && (
            <button
              onClick={(e) => { e.stopPropagation(); enableMotion(); }}
              style={{ marginTop: 24, padding: '10px 18px', borderRadius: 22, border: '1px solid rgba(255,255,255,0.5)', color: '#fff', fontSize: 14, fontWeight: 500, background: 'transparent' }}
            >
              Count by motion instead
            </button>
          )}
          {motionErr && <div style={{ marginTop: 14, fontSize: 14, opacity: 0.85 }}>{motionErr}</div>}

          <div style={{ position: 'absolute', bottom: 'max(28px, env(safe-area-inset-bottom))', fontSize: 13, opacity: 0.7 }}>
            It won’t turn off until you finish.
          </div>
        </>
      )}
    </div>
  );
}
