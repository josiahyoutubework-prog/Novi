import { useParams, useNavigate } from 'react-router-dom';
import { useMissionDetail } from '../lib/hooks';
import './screens.css';

// Actor → dot colour on the vertical timeline.
function dotFor(a: { actor: string; isToday: boolean; future: boolean }) {
  if (a.isToday) return { size: 12, color: 'var(--accent)', glow: true, ring: false };
  if (a.actor === 'RISK') return { size: 9, color: 'var(--warning)', glow: false, ring: false };
  if (a.future) return { size: 9, color: 'transparent', glow: false, ring: true };
  return { size: 9, color: 'var(--dot-not-started)', glow: false, ring: false };
}
function inkFor(a: { actor: string; isToday: boolean }) {
  if (a.isToday) return 'var(--accent)';
  if (a.actor === 'RISK') return 'var(--warning-ink)';
  return 'var(--muted-2)';
}

export default function Timeline() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data } = useMissionDetail(id);
  if (!data) return <div className="screen"><div className="spin" /></div>;
  const { mission: m, activity } = data;

  return (
    <div className="screen">
      <div className="back-link" onClick={() => nav(`/missions/${m.id}`)}>← {m.title}</div>
      <div className="eyebrow" style={{ marginTop: 16 }}>{m.title.toUpperCase()}</div>
      <h1 style={{ margin: '16px 0 0', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Timeline</h1>

      <div style={{ marginTop: 26 }}>
        {activity.map((a, i) => {
          const d = dotFor(a);
          const last = i === activity.length - 1;
          return (
            <div key={a.id} style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 }}>
                <span
                  className={d.ring ? 'dot ring' : undefined}
                  style={{
                    width: d.size, height: d.size, borderRadius: '50%', flexShrink: 0,
                    background: d.ring ? 'transparent' : d.color,
                    boxShadow: d.glow ? '0 0 0 4px var(--accent-glow)' : undefined,
                    marginTop: 2,
                  }}
                />
                {!last && <span style={{ flex: 1, width: 1, background: 'var(--line-strong)' }} />}
              </div>
              <div style={{ paddingBottom: 22, flex: 1, opacity: a.future ? 0.75 : 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: inkFor(a) }}>{a.dateLabel}</div>
                <div style={{ marginTop: 5, fontSize: a.isToday ? 17 : 16, fontWeight: a.isToday ? 500 : 400 }}>{a.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {m.dependency && (
        <div style={{ marginTop: 4, paddingTop: 18, borderTop: '1px solid var(--line-strong)', fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
          {m.dependency} <span className="link" onClick={() => nav(`/missions/${m.id}`)}>See dependencies</span>
        </div>
      )}
    </div>
  );
}
