import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { intelInk } from '../lib/status';

export default function NoviHub() {
  const nav = useNavigate();
  const intelligence = useStore((s) => s.intelligence);
  const agents = useStore((s) => s.agents);
  const memory = useStore((s) => s.memory);
  const user = useStore((s) => s.user);
  const top = intelligence[0];

  const sections = [
    { label: 'Intelligence', value: `${intelligence.length} things Novi noticed`, path: '/intelligence' },
    { label: 'Agents', value: `${agents.filter((a) => a.status === 'active').length} active`, path: '/agents' },
    { label: 'Autonomy', value: user?.autonomyLevel ?? '', path: '/autonomy' },
    { label: 'Memory', value: `${memory.length} items`, path: '/memory' },
    { label: 'Settings', value: user?.calendarConnected ? '' : '1 needs attention', path: '/settings', warn: !user?.calendarConnected },
  ];

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Novi</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)' }}>The intelligence and trust layer underneath your missions.</div>

      {top && (
        <div style={{ marginTop: 24, paddingLeft: 16, borderLeft: `2px solid ${intelInk(top.kind) === 'var(--muted)' ? 'var(--line-stronger)' : intelInk(top.kind)}` }} onClick={() => nav('/intelligence')}>
          <div className="mono" style={{ color: intelInk(top.kind) }}>{top.whenLabel}</div>
          <div style={{ marginTop: 8, fontSize: 17, fontWeight: 500, lineHeight: 1.4 }}>{top.headline}</div>
          <div style={{ marginTop: 6, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.5 }}>{top.detail}</div>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        {sections.map((s, i, arr) => (
          <div
            key={s.path}
            onClick={() => nav(s.path)}
            style={{ padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: i === arr.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: 17 }}
          >
            <span>{s.label}</span>
            <span style={{ fontSize: 15, color: s.warn ? 'var(--warning-ink)' : 'var(--muted)' }}>{s.value} ›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
