import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { AutonomyLevel } from '../types';
import './screens.css';

const LEVELS: { name: AutonomyLevel; desc: string }[] = [
  { name: 'Assist', desc: 'Novi recommends. You do everything.' },
  { name: 'Co-pilot', desc: 'Novi prepares the work. You approve it.' },
  { name: 'Autopilot', desc: 'Novi acts inside the categories you allow.' },
];

// Human labels for the autonomy categories.
const ALLOWED = [
  { key: 'monitor', label: 'Monitor job listings and prices' },
  { key: 'organise', label: 'Organise research' },
  { key: 'draft', label: 'Draft messages for you' },
];
const ASK = [
  { key: 'send', label: 'Send messages to people' },
  { key: 'apply', label: 'Apply for jobs' },
  { key: 'purchase', label: 'Spend money or book anything' },
  { key: 'share', label: 'Share your personal details' },
];

export default function Autonomy() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const setAutonomy = useStore((s) => s.setAutonomy);
  const updateSettings = useStore((s) => s.updateSettings);
  const toast = useStore((s) => s.toast);
  if (!user) return null;

  const allowed = new Set(user.allowedCategories);

  const pick = async (lvl: AutonomyLevel) => {
    if (lvl === user.autonomyLevel) return;
    await setAutonomy(lvl);
    toast(`Autonomy set to ${lvl}.`);
  };

  // Toggling a category moves it between allowed and must-ask (Autopilot only moves them).
  const toggle = async (key: string, currentlyAllowed: boolean) => {
    const nextAllowed = new Set(user.allowedCategories);
    const nextAsk = new Set(user.mustAskCategories);
    if (currentlyAllowed) { nextAllowed.delete(key); nextAsk.add(key); }
    else { nextAsk.delete(key); nextAllowed.add(key); }
    await updateSettings({ allowedCategories: [...nextAllowed], mustAskCategories: [...nextAsk] });
    toast(currentlyAllowed ? `Novi will now ask before it can ${labelFor(key)}.` : `Novi can now ${labelFor(key)} on its own.`);
  };

  return (
    <div className="screen" style={{ maxWidth: 720 }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em' }}>Autonomy</h1>
      <div style={{ marginTop: 10, fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.55 }}>
        How much Novi does on its own. This applies to every mission and every agent.
      </div>

      <div className="level-cards" style={{ marginTop: 32 }}>
        {LEVELS.map((l) => {
          const current = l.name === user.autonomyLevel;
          return (
            <div key={l.name} className={`level-card${current ? ' current' : ''}`} onClick={() => pick(l.name)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{l.name}</div>
                {current && <div className="mono" style={{ color: 'var(--accent)' }}>CURRENT</div>}
              </div>
              <div style={{ marginTop: 7, fontSize: 14, color: current ? 'var(--ink-3)' : 'var(--muted)', lineHeight: 1.5 }}>{l.desc}</div>
            </div>
          );
        })}
      </div>

      <ToggleList title="NOVI CAN DO THIS ON ITS OWN" items={ALLOWED} on={(k) => allowed.has(k)} onToggle={(k) => toggle(k, true)} />
      <ToggleList title="NOVI MUST ASK FIRST" items={ASK} on={(k) => allowed.has(k)} onToggle={(k) => toggle(k, allowed.has(k))} />

      <div style={{ marginTop: 22, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        Novi completed 9 actions this week under these rules. <span className="link" onClick={() => nav('/intelligence')}>See the log</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 15, color: 'var(--muted)' }}>
        Novi remembers {useStore.getState().memory.length} things about you. <span className="link" onClick={() => nav('/memory')}>Review memory</span>
      </div>
    </div>
  );
}

function labelFor(key: string) {
  return [...ALLOWED, ...ASK].find((x) => x.key === key)?.label.toLowerCase() ?? key;
}

function ToggleList({ title, items, on, onToggle }: {
  title: string; items: { key: string; label: string }[]; on: (k: string) => boolean; onToggle: (k: string) => void;
}) {
  return (
    <div style={{ marginTop: 28 }}>
      <div className="mono">{title}</div>
      <div style={{ marginTop: 12 }}>
        {items.map((it, i, arr) => (
          <div key={it.key} style={{ padding: '13px 0', borderTop: '1px solid var(--line)', borderBottom: i === arr.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 16 }}>{it.label}</div>
            <button className={`toggle${on(it.key) ? ' on' : ''}`} onClick={() => onToggle(it.key)} aria-label={`Toggle ${it.label}`}><span /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
