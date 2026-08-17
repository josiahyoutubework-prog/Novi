import { useStore } from '../store';
import './screens.css';

const PRESETS = [10, 20, 30, 50];

export default function Fitness() {
  const fitness = useStore((s) => s.fitness);
  const saveFitness = useStore((s) => s.saveFitness);
  const triggerAlarm = useStore((s) => s.triggerAlarm);
  const toast = useStore((s) => s.toast);

  if (!fitness) return <div className="screen"><div className="spin" /></div>;
  const s = fitness.settings;

  const setGoal = (n: number) => saveFitness({ pushupGoal: Math.max(1, Math.min(500, n)) });

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Fitness</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        Get moving before the day starts. A morning alarm that won't turn off until you earn it.
      </div>

      {/* Streak */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line-strong)', display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', color: fitness.streak > 0 ? 'var(--success-ink)' : 'var(--ink)' }}>{fitness.streak}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500 }}>day streak</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>{fitness.completedToday ? 'Done today — nice.' : 'Not done today yet.'}</div>
        </div>
      </div>

      {/* Pushup alarm */}
      <div className="sect">
        <div className="mono">PUSHUP ALARM</div>

        <Row label="Alarm" sub={s.enabled ? `Rings at ${s.alarmTime}` : 'Off'}>
          <button className={`toggle${s.enabled ? ' on' : ''}`} onClick={() => saveFitness({ enabled: !s.enabled })} aria-label="Toggle alarm"><span /></button>
        </Row>

        <Row label="Wake time" sub="When it rings while Novi is open">
          <input
            type="time"
            value={s.alarmTime}
            onChange={(e) => saveFitness({ alarmTime: e.target.value })}
            style={{ border: '1px solid var(--line-strong)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, fontFamily: 'var(--font-ui)' }}
          />
        </Row>

        <Row label="Pushups to turn it off" sub="Set your own number">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="round-add" style={{ background: 'var(--bg)', color: 'var(--ink)', border: '1px solid var(--line-stronger)', width: 30, height: 30, fontSize: 18 }} onClick={() => setGoal(s.pushupGoal - 5)}>−</button>
            <div style={{ minWidth: 34, textAlign: 'center', fontSize: 20, fontWeight: 600 }}>{s.pushupGoal}</div>
            <button className="round-add" style={{ width: 30, height: 30, fontSize: 18 }} onClick={() => setGoal(s.pushupGoal + 5)}>+</button>
          </div>
        </Row>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((n) => (
            <button key={n} className={`chip sm${s.pushupGoal === n ? ' active' : ''}`} onClick={() => setGoal(n)}>{n}</button>
          ))}
        </div>

        <Row label="Counting" sub={s.countMode === 'tap' ? 'Tap the screen at the bottom of each rep' : 'Auto-count by phone motion'}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`chip sm${s.countMode === 'tap' ? ' active' : ''}`} onClick={() => saveFitness({ countMode: 'tap' })}>Tap</button>
            <button className={`chip sm${s.countMode === 'motion' ? ' active' : ''}`} onClick={() => saveFitness({ countMode: 'motion' })}>Motion</button>
          </div>
        </Row>

        <Row label="Alarm sound" sub={s.soundOn ? 'On' : 'Silent'} last>
          <button className={`toggle${s.soundOn ? ' on' : ''}`} onClick={() => saveFitness({ soundOn: !s.soundOn })} aria-label="Toggle sound"><span /></button>
        </Row>
      </div>

      <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => triggerAlarm('now')}>Do the challenge now</button>
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, textAlign: 'center' }}>
        The alarm rings while Novi is open. Add Novi to your home screen so it's ready each morning.
      </div>

      {/* Recent */}
      {fitness.log.length > 0 && (
        <div className="sect">
          <div className="mono">RECENT</div>
          <div style={{ marginTop: 12 }}>
            {fitness.log.slice(0, 8).map((l, i, arr) => (
              <div key={l.id} style={{ padding: '13px 0', borderTop: '1px solid var(--line)', borderBottom: i === arr.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                <span>{fmtDay(l.date)}</span>
                <span style={{ color: 'var(--muted)' }}>{l.reps} pushups{l.kind === 'now' ? ' · practice' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, sub, children, last }: { label: string; sub?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginTop: 14, paddingBottom: 14, borderBottom: last ? undefined : '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <div>
        <div style={{ fontSize: 16 }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function fmtDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
