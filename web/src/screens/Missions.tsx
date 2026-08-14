import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { missionColor, missionInk, missionLabel } from '../lib/status';
import { fmtDate } from '../lib/hooks';
import './screens.css';

export default function Missions() {
  const nav = useNavigate();
  const missions = useStore((s) => s.missions);
  const active = missions.filter((m) => m.status !== 'complete');
  const done = missions.filter((m) => m.status === 'complete');

  if (missions.length === 0) return <EmptyState />;

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Missions</h1>
        <div className="round-add" onClick={() => nav('/new')}>+</div>
      </div>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)' }}>
        {active.length} active{done.length ? `, ${done.length} finished` : ''}.
      </div>

      <div style={{ marginTop: 26 }}>
        {[...active, ...done].map((m, i, arr) => (
          <div
            key={m.id}
            onClick={() => nav(`/missions/${m.id}`)}
            style={{
              padding: '20px 0', borderTop: '1px solid var(--line-strong)',
              borderBottom: i === arr.length - 1 ? '1px solid var(--line-strong)' : undefined,
              opacity: m.status === 'complete' ? 0.5 : 1, cursor: 'pointer', transition: 'background .12s',
            }}
            className="mrow"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <div style={{ fontSize: 19, fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: missionInk(m.status) }}>{missionLabel[m.status]}</div>
            </div>
            <div style={{ marginTop: 5, fontSize: 14, color: 'var(--muted)' }}>{missionSubtitle(m)}</div>
            {m.status !== 'complete' && (
              <div className="progress" style={{ marginTop: 12 }}>
                <span style={{ width: `${m.progress}%`, background: missionColor(m.status) }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function missionSubtitle(m: { status: string; targetDate: string | null; statusNote: string }) {
  if (m.targetDate) {
    return `${fmtDate(m.targetDate)} · ${m.statusNote}`;
  }
  return m.statusNote;
}

function EmptyState() {
  const nav = useNavigate();
  const starters = ['Get a new job', 'Move somewhere new', 'Save for something big', 'Start a business'];
  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Missions</h1>
        <div className="round-add" onClick={() => nav('/new')}>+</div>
      </div>
      <div style={{ minHeight: '54vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What are you trying to accomplish?</div>
        <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55, color: 'var(--muted)' }}>One thing that matters and has a date. Novi will work out everything it takes.</div>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {starters.map((s) => (
            <button key={s} className="chip" style={{ borderRadius: 14, textAlign: 'left', padding: '14px 16px', fontSize: 16 }} onClick={() => nav('/new')}>{s}</button>
          ))}
        </div>
        <button className="btn btn-dark" style={{ marginTop: 24 }} onClick={() => nav('/new')}>Describe it in my own words</button>
      </div>
    </div>
  );
}
