import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Check } from '../components/ui';

export default function AgentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const agents = useStore((s) => s.agents);
  const missions = useStore((s) => s.missions);
  const activate = useStore((s) => s.activateAgent);
  const toast = useStore((s) => s.toast);

  const agent = agents.find((a) => a.id === id);
  if (!agent) return <div className="screen"><div className="spin" /></div>;

  // The mission this agent would best serve.
  const target = missions.find((m) => m.title.startsWith('Save')) ?? missions.find((m) => m.status !== 'complete') ?? missions[0];
  const isActive = agent.status === 'active';

  const onActivate = async () => {
    await activate(agent.id, target?.id);
    toast(`${agent.name} activated${target ? ` on ${target.title}` : ''}.`);
    nav('/agents');
  };

  return (
    <div className="screen">
      <div className="back-link" onClick={() => nav('/agents')}>← Agents</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, background: isActive ? 'var(--accent)' : 'var(--line-stronger)' }} />
        <div className="eyebrow">AGENT</div>
      </div>
      <h1 style={{ margin: '18px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em' }}>{agent.name}</h1>
      <div style={{ marginTop: 10, fontSize: 17, lineHeight: 1.5, color: 'var(--ink-3)' }}>{agent.description}</div>

      {agent.does.length > 0 && (
        <div className="sect">
          <div className="mono">WHAT IT DOES</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: 'var(--ink-2)' }}>
            {agent.does.map((d, i) => <div key={i} style={{ display: 'flex', gap: 11 }}><Check />{d}</div>)}
          </div>
        </div>
      )}

      {agent.needs.length > 0 && (
        <div className="sect">
          <div className="mono">IT WILL NEED</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: 'var(--ink-2)' }}>
            {agent.needs.map((n, i) => <div key={i} style={{ display: 'flex', gap: 11 }}><Check tone="muted" />{n}</div>)}
          </div>
          {agent.limitation && <div style={{ marginTop: 12, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{agent.limitation}</div>}
        </div>
      )}

      <div className="sect" style={{ display: 'flex', gap: 26 }}>
        <div>
          <div className="mono">USED ON</div>
          <div style={{ marginTop: 6, fontSize: 16 }}>{isActive ? 'This mission' : '2 of your missions'}</div>
        </div>
        <div>
          <div className="mono">INCLUDED IN</div>
          <div style={{ marginTop: 6, fontSize: 16 }}>Novi Pro</div>
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isActive
          ? <div className="btn disabled">Already active</div>
          : <button className="btn btn-primary" onClick={onActivate}>Activate{target ? ` on ${target.title}` : ''}</button>}
        <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={() => nav('/agents')}>Browse all agents</div>
      </div>
    </div>
  );
}
