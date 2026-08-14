import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

// The dark "mission complete" moment. Uses the Vancouver record when that
// mission is the target, otherwise a generic completion summary.
export default function MissionComplete() {
  const { id } = useParams();
  const nav = useNavigate();
  const missions = useStore((s) => s.missions);
  const mission = missions.find((m) => m.id === id);

  const isVancouver = mission?.title.includes('Vancouver');
  const headline = isVancouver ? 'You live in Vancouver.' : `You finished "${mission?.title ?? 'your mission'}".`;
  const rows = isVancouver
    ? [
        ['Finished', 'June 11, four days early'],
        ['Job secured', 'Hootsuite, March 18'],
        ['Saved', '$9,720'],
        ['Novi handled', '163 actions'],
      ]
    : [
        ['Finished', 'On time'],
        ['Phases', `${mission?.phases.length ?? 0} completed`],
        ['Novi handled', 'Every step it could'],
      ];

  return (
    <div className="theme-dark" style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 402, boxSizing: 'border-box', padding: 'max(64px, env(safe-area-inset-top)) 28px 40px', display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <div className="eyebrow ok" style={{ color: 'var(--success)' }}>MISSION COMPLETE</div>
        <div style={{ marginTop: 22, fontSize: 36, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{headline}</div>
        <div style={{ marginTop: 14, fontSize: 17, lineHeight: 1.55, color: 'var(--ink-3)' }}>Ten months, four phases, one date that never moved.</div>

        <div style={{ marginTop: 38 }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: i === rows.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
              <span style={{ color: 'var(--ink-3)' }}>{k}</span><span>{v}</span>
            </div>
          ))}
        </div>

        {isVancouver && (
          <div style={{ marginTop: 30, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            The lease notice, the MSP waiting period and the licence swap were all things you hadn't listed. Novi caught them in February.
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn" style={{ background: 'var(--ink)', color: 'var(--ink-fill-text)' }} onClick={() => nav('/new')}>Start something new</button>
          <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={() => nav('/')}>Keep the record</div>
        </div>
      </div>
    </div>
  );
}
