import { useEffect, useRef } from 'react';
import { useStore } from '../store';

// While Novi is open, fires the pushup alarm when the clock hits the set time.
// (A web app can't wake a closed tab — for that you'd install Novi to your home
// screen, or a future native app.) Checks every 15s.
export default function AlarmScheduler() {
  const firedFor = useRef<string>('');

  useEffect(() => {
    const check = () => {
      const s = useStore.getState();
      const f = s.fitness;
      if (!f || !f.settings.enabled || s.alarmActive || f.completedToday) return;
      const d = new Date();
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const key = `${d.toISOString().slice(0, 10)} ${hhmm}`;
      if (hhmm === f.settings.alarmTime && firedFor.current !== key) {
        firedFor.current = key;
        s.triggerAlarm('alarm');
      }
    };
    check();
    const id = window.setInterval(check, 15000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
