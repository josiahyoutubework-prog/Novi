import type { ReactNode } from 'react';
import type { Mission, MissionStatus } from '../types';
import { missionColor, missionInk, missionLabel, phaseColor, phaseInk, phaseLabel } from '../lib/status';

export function Eyebrow({ children, tone }: { children: ReactNode; tone?: 'accent' | 'warn' | 'ok' }) {
  return <div className={`eyebrow${tone ? ' ' + (tone === 'warn' ? 'warn' : tone === 'ok' ? 'ok' : 'accent') : ''}`}>{children}</div>;
}

export function SectionLabel({ children, tone }: { children: ReactNode; tone?: 'accent' | 'warn' | 'ok' }) {
  return <div className={`mono${tone ? ' ' + tone : ''}`} style={tone === 'warn' ? { color: 'var(--warning-ink)' } : tone === 'accent' ? { color: 'var(--accent)' } : tone === 'ok' ? { color: 'var(--success-ink)' } : undefined}>{children}</div>;
}

export function StatusChip({ status }: { status: MissionStatus }) {
  return (
    <span className="status-chip" style={{ color: missionInk(status), borderColor: missionColor(status) }}>
      {missionLabel[status]}
    </span>
  );
}

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="progress">
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// The vertical phase list used on Mission detail (dot + name + status word).
export function PhaseTimeline({ mission }: { mission: Mission }) {
  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>
      {mission.phases.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`dot${p.status === 'not_started' ? ' ring' : ''}`} style={p.status !== 'not_started' ? { background: phaseColor(p.status) } : undefined} />
          <span style={{ flex: 1, fontSize: 16, fontWeight: p.status === 'not_started' ? 400 : 500, color: p.status === 'not_started' ? 'var(--muted)' : 'var(--ink)' }}>{p.name}</span>
          <span style={{ fontSize: 14, color: phaseInk(p.status) }}>{phaseLabel(p.status)}</span>
        </div>
      ))}
    </div>
  );
}

// The signature dot-and-line vertical phase list (used on the plan reveal).
export function PhaseDotLine({ phases }: { phases: Mission['phases'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {phases.map((p, i) => {
        const last = i === phases.length - 1;
        const filled = i === 0;
        return (
          <div key={i} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: filled ? 'var(--accent)' : 'var(--dot-not-started)', marginTop: 6 }} />
              {!last && <span style={{ flex: 1, width: 1, background: 'var(--line-strong)' }} />}
            </div>
            <div style={{ paddingBottom: last ? 0 : 16 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{p.name}</div>
              {p.note && <div style={{ fontSize: 14, color: 'var(--muted)' }}>{p.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function NoticedBlock({ tone = 'warn', label, children, cta, onCta }: {
  tone?: 'warn' | 'ok' | 'neutral'; label: string; children: ReactNode; cta?: string; onCta?: () => void;
}) {
  return (
    <div className={`noticed${tone === 'ok' ? ' ok' : tone === 'neutral' ? ' neutral' : ''}`}>
      <div className="mono" style={{ color: tone === 'warn' ? 'var(--warning-ink)' : tone === 'ok' ? 'var(--success-ink)' : 'var(--muted)' }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 16, lineHeight: 1.45 }}>{children}</div>
      {cta && <div className="link" style={{ marginTop: 10, fontSize: 15 }} onClick={onCta}>{cta}</div>}
    </div>
  );
}

export function ScreenTitle({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h1>
        {action}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

export function Check({ tone = 'ok' }: { tone?: 'ok' | 'active' | 'muted' }) {
  if (tone === 'active') return <span style={{ color: 'var(--accent)' }}>●</span>;
  if (tone === 'muted') return <span style={{ color: 'var(--muted-2)' }}>○</span>;
  return <span style={{ color: 'var(--success)' }}>✓</span>;
}
