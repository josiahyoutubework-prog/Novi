import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { intelColor, intelInk } from '../lib/status';

export default function Intelligence() {
  const nav = useNavigate();
  const intelligence = useStore((s) => s.intelligence);
  const toast = useStore((s) => s.toast);

  const onCta = (it: (typeof intelligence)[number]) => {
    if (it.missionId) nav(`/missions/${it.missionId}`);
    else toast('Novi opened the detail behind this.');
  };

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Novi noticed</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)' }}>
        Six days of watching, {intelligence.length} things worth telling you.
      </div>

      <div style={{ marginTop: 26 }}>
        {intelligence.map((it, i) => (
          <div
            key={it.id}
            style={{
              padding: '18px 0 18px 16px', borderTop: '1px solid var(--line-strong)',
              borderBottom: i === intelligence.length - 1 ? '1px solid var(--line-strong)' : undefined,
              borderLeft: `2px solid ${intelColor(it.kind)}`,
            }}
          >
            <div className="mono" style={{ color: intelInk(it.kind) }}>{it.whenLabel}</div>
            <div style={{ marginTop: 9, fontSize: 18, fontWeight: 500, lineHeight: 1.4 }}>{it.headline}</div>
            <div style={{ marginTop: 6, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.5 }}>{it.detail}</div>
            {it.ctaLabel && <div className="link" style={{ marginTop: 11, fontSize: 15 }} onClick={() => onCta(it)}>{it.ctaLabel}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
