import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Agents() {
  const nav = useNavigate();
  const agents = useStore((s) => s.agents);
  const activate = useStore((s) => s.activateAgent);
  const toast = useStore((s) => s.toast);

  const working = agents.filter((a) => a.status === 'active');
  const suggested = agents.filter((a) => a.status === 'suggested');
  const available = agents.filter((a) => a.status === 'available');

  const onActivate = async (id: string, name: string) => {
    await activate(id);
    toast(`${name} is now working on your mission.`);
  };

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Agents</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        Specialists Novi puts to work on a mission. {working.length === 2 ? 'Two are active.' : `${working.length} active.`}
      </div>

      <Group label="WORKING NOW">
        {working.map((a, i, arr) => (
          <AgentRow key={a.id} last={i === arr.length - 1} onClick={() => nav(`/agents/${a.id}`)}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 500 }}>{a.name}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>{a.summary}</div>
            </div>
          </AgentRow>
        ))}
      </Group>

      {suggested.length > 0 && (
        <Group label="SUGGESTED FOR THIS MISSION">
          {suggested.map((a, i, arr) => (
            <AgentRow key={a.id} last={i === arr.length - 1} onClick={() => nav(`/agents/${a.id}`)}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--line-stronger)', marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>{a.summary}</div>
              </div>
              <div className="link" style={{ fontSize: 14, paddingTop: 3 }} onClick={(e) => { e.stopPropagation(); onActivate(a.id, a.name); }}>Activate</div>
            </AgentRow>
          ))}
        </Group>
      )}

      <div style={{ marginTop: 26 }} className="mono">ALSO AVAILABLE</div>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {available.map((a) => <button key={a.id} className="chip sm" onClick={() => nav(`/agents/${a.id}`)}>{a.name}</button>)}
      </div>

      <div style={{ marginTop: 26, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        Every agent works under the same permissions you set. <span className="link" onClick={() => nav('/autonomy')}>Autonomy</span>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div className="mono">{label}</div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function AgentRow({ children, last, onClick }: { children: React.ReactNode; last: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ padding: '16px 0', borderTop: '1px solid var(--line-strong)', borderBottom: last ? '1px solid var(--line-strong)' : undefined, display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}
    >{children}</div>
  );
}
