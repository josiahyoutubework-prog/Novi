import { useParams, useNavigate } from 'react-router-dom';
import { useMissionDetail } from '../lib/hooks';
import { StatusChip, PhaseTimeline, NoticedBlock, Check } from '../components/ui';
import { intelInk, phaseColor, phaseInk, phaseLabel } from '../lib/status';
import { useStore } from '../store';
import './screens.css';

export default function MissionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data } = useMissionDetail(id);
  const resolveAction = useStore((s) => s.resolveAction);

  if (!data) return <div className="screen"><div className="spin" /></div>;
  const { mission: m, intelligence, agents, actions } = data;
  const notice = intelligence.find((i) => i.kind === 'risk') ?? intelligence[0];
  const dep = intelligence.find((i) => i.kind === 'dependency');
  const activeAgents = agents.filter((a) => a.status === 'active');

  return (
    <div className="screen wide">
      <div className="back-link" onClick={() => nav('/missions')}>← Missions</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div className="eyebrow">MISSION</div>
        <StatusChip status={m.status} />
      </div>
      <h1 style={{ margin: '16px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{m.title}</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)' }}>{m.targetLabel}</div>

      <div className="subnav">
        <button className="active">Overview</button>
        <button onClick={() => nav(`/missions/${m.id}/timeline`)}>Timeline</button>
        <button onClick={() => nav(`/missions/${m.id}/forgetting`)}>What am I forgetting?</button>
        <button onClick={() => nav(`/missions/${m.id}/chat`)}>Ask Novi</button>
      </div>

      <div className="two-col" style={{ marginTop: 24 }}>
        <div className="main-col">
          <div style={{ paddingTop: 20, borderTop: '1px solid var(--line-strong)' }}>
            <div className="mono">TIMELINE</div>
            <PhaseTimeline mission={m} />
          </div>

          <div className="sect">
            <div className="mono">WHAT MATTERS NOW</div>
            <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.5 }}>{m.whatMatters || 'Nothing needs you right now. Novi is running the plan in the background.'}</div>
          </div>

          {actions.filter((a) => a.status === 'open').length > 0 && (
            <div className="sect">
              <div className="mono">ACTIONS ON THIS MISSION</div>
              <div style={{ marginTop: 6 }}>
                {actions.filter((a) => a.status === 'open').map((a, i, arr) => (
                  <div key={a.id} style={{ padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: i === arr.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{a.title}</div>
                      <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>{a.subtitle}</div>
                    </div>
                    <button className="btn btn-secondary sm" onClick={() => nav('/actions')}>Open</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sect">
            <div className="mono">NOVI IS HANDLING</div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 16, color: 'var(--ink-2)' }}>
              {m.handling.length === 0 && <div style={{ color: 'var(--muted)' }}>Novi will start working as the plan gets going.</div>}
              {m.handling.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}><Check tone={h.state === 'done' ? 'ok' : 'active'} />{h.text}</div>
              ))}
            </div>
          </div>

          <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={() => nav(`/missions/${m.id}/forgetting`)}>What am I forgetting?</button>
        </div>

        <div className="rail" style={{ marginTop: 4 }}>
          {notice && (
            <div className="rail-sect">
              <NoticedBlock label={notice.kind === 'risk' ? 'NOVI NOTICED' : notice.whenLabel} cta={notice.ctaLabel || undefined} onCta={() => nav('/intelligence')}>
                {notice.headline}. {notice.detail}
              </NoticedBlock>
            </div>
          )}
          {m.dependency && (
            <div className="rail-sect">
              <div className="mono">DEPENDENCY</div>
              <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)' }}>{m.dependency}</div>
            </div>
          )}
          {activeAgents.length > 0 && (
            <div className="rail-sect">
              <div className="mono">AGENTS ON THIS MISSION</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 15 }}>
                {activeAgents.map((a) => (
                  <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => nav(`/agents/${a.id}`)}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }} />{a.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {m.progress >= 100 && (
            <button className="btn btn-primary" onClick={() => nav(`/missions/${m.id}/complete`)}>See the result</button>
          )}
        </div>
      </div>
    </div>
  );
}
