import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { greeting, todayLabel, fmtDate } from '../lib/hooks';
import { missionColor } from '../lib/status';
import { NoticedBlock, Check } from '../components/ui';
import { intelInk } from '../lib/status';
import './screens.css';

export default function Home() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const missions = useStore((s) => s.missions);
  const actions = useStore((s) => s.actions);
  const intelligence = useStore((s) => s.intelligence);

  const focus = missions.find((m) => m.status !== 'complete') ?? missions[0];
  const topActions = actions.slice(0, 3);
  const notice = intelligence.find((i) => i.kind === 'risk') ?? intelligence[0];
  const since = missions.flatMap((m) => m.handling).filter((h) => h.state === 'done').slice(0, 3);

  if (!focus) {
    return <EmptyHome />;
  }

  const name = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className="screen wide">
      <div style={{ fontSize: 15, color: 'var(--muted)' }}>{todayLabel()}</div>
      <h1 style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>{greeting()}, {name}</h1>

      <div className="two-col" style={{ marginTop: 30 }}>
        <div className="main-col">
          {/* YOUR FOCUS */}
          <div style={{ paddingTop: 20, borderTop: '1px solid var(--line-strong)' }}>
            <div className="mono">YOUR FOCUS</div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, cursor: 'pointer' }} onClick={() => nav(`/missions/${focus.id}`)}>
              <div style={{ fontSize: 21, fontWeight: 600 }}>{focus.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: missionColor(focus.status) }}>{focus.progress}% {focus.status === 'behind' ? 'BEHIND' : focus.status === 'blocked' ? 'BLOCKED' : 'ON TRACK'}</div>
            </div>
            <div className="progress" style={{ marginTop: 12 }}>
              <span style={{ width: `${focus.progress}%`, background: missionColor(focus.status) }} />
            </div>
          </div>

          {/* THREE THINGS TODAY */}
          <div style={{ marginTop: 26 }}>
            <div className="mono" style={{ paddingBottom: 12 }}>THREE THINGS TODAY</div>
            {topActions.length === 0 && (
              <div style={{ padding: '14px 0', borderTop: '1px solid var(--line)', fontSize: 16, color: 'var(--muted)' }}>You're all caught up. Novi will surface the next thing when it matters.</div>
            )}
            {topActions.map((a, i) => (
              <div key={a.id} className="row" style={i === topActions.length - 1 ? { borderBottom: '1px solid var(--line)' } : undefined} onClick={() => nav('/actions')}>
                <div className="row-idx">{String(i + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1 }}>
                  <div className="row-title">{a.title.replace(/\?$/, '')}</div>
                  <div className="row-sub">{a.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* NOVI NOTICED */}
          {notice && (
            <div style={{ marginTop: 26 }}>
              <NoticedBlock label="NOVI NOTICED" cta="See adjustment" onCta={() => nav('/intelligence')}>
                {notice.headline}. {notice.detail}
              </NoticedBlock>
            </div>
          )}

          {/* NOVI IS WORKING ON */}
          <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid var(--line-strong)' }}>
            <div className="mono">NOVI IS WORKING ON</div>
            {focus.workingOn.map((w, i) => (
              <div key={i} style={{ marginTop: i === 0 ? 12 : 10, display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span>{w.label}</span><span style={{ color: 'var(--muted)' }}>{w.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail (desktop) */}
        <div className="rail" style={{ marginTop: 4 }}>
          <div className="rail-sect">
            <div className="mono">SINCE YESTERDAY</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 15, color: 'var(--ink-2)' }}>
              {since.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}><Check />{s.text}</div>
              ))}
            </div>
          </div>
          <div className="rail-sect">
            <div className="mono">YOUR MISSIONS</div>
            <div className="mission-cards" style={{ marginTop: 16, gridTemplateColumns: '1fr' }}>
              {missions.filter((m) => m.status !== 'complete').map((m) => (
                <div key={m.id} className="mission-card" onClick={() => nav(`/missions/${m.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: missionColor(m.status) }}>
                      {m.status === 'behind' ? 'BEHIND' : m.status === 'blocked' ? 'BLOCKED' : 'ON TRACK'}
                    </div>
                  </div>
                  {m.targetDate && <div style={{ marginTop: 5, fontSize: 13, color: 'var(--muted)' }}>{fmtDate(m.targetDate, { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                  <div className="progress" style={{ marginTop: 12 }}><span style={{ width: `${m.progress}%`, background: missionColor(m.status) }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rail-sect" style={{ marginTop: 'auto' }}>
            <div onClick={() => nav('/novi')} style={{ padding: 16, border: '1px solid var(--line-strong)', borderRadius: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 15, color: 'var(--muted)' }}>Ask Novi anything about your missions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyHome() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Home</h1>
        <div className="round-add" onClick={() => nav('/new')}>+</div>
      </div>
      <div style={{ minHeight: '52vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 }}>What are you trying to accomplish?</div>
        <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55, color: 'var(--muted)' }}>One thing that matters and has a date. Novi will work out everything it takes.</div>
        <button className="btn btn-dark" style={{ marginTop: 24 }} onClick={() => nav('/new')}>Describe it in my own words</button>
      </div>
    </div>
  );
}
