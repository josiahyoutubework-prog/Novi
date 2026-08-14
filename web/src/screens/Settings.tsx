import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Settings() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const memory = useStore((s) => s.memory);
  const updateSettings = useStore((s) => s.updateSettings);
  const logout = useStore((s) => s.logout);
  const toast = useStore((s) => s.toast);
  if (!user) return null;

  const cycleTheme = () => {
    const order = ['system', 'light', 'dark'] as const;
    const next = order[(order.indexOf(user.theme) + 1) % 3];
    updateSettings({ theme: next });
    toast(`Appearance: ${next[0].toUpperCase() + next.slice(1)}`);
  };
  const cycleNotifications = () => {
    const order = ['Important only', 'All updates', 'Off'];
    const next = order[(order.indexOf(user.notifications) + 1) % order.length];
    updateSettings({ notifications: next });
  };
  const reconnect = () => {
    updateSettings({ calendarConnected: true });
    toast('Calendar reconnected. Deadlines will appear again.');
  };

  const rows: { label: string; value: string; warn?: boolean; onClick?: () => void }[] = [
    { label: 'Autonomy', value: user.autonomyLevel, onClick: () => nav('/autonomy') },
    { label: 'Memory', value: `${memory.length} items`, onClick: () => nav('/memory') },
    { label: 'Notifications', value: user.notifications, onClick: cycleNotifications },
    { label: 'Connected services', value: user.calendarConnected ? 'All connected' : '1 needs attention', warn: !user.calendarConnected, onClick: () => user.calendarConnected ? toast('Calendar, email and contacts are connected. Novi only reads what it needs.') : nav('/permission') },
    { label: 'Privacy', value: 'You’re in control', onClick: () => { toast('Your privacy controls live in Autonomy and Memory — you decide what Novi can do and what it keeps.'); nav('/autonomy'); } },
    { label: 'Billing', value: user.plan === 'Novi Pro' ? '$20 / month' : 'Free', onClick: () => toast(user.plan === 'Novi Pro' ? 'Novi Pro · $20/month · renews monthly. Card management opens here in production.' : 'You’re on the free plan. Upgrade to Novi Pro for unlimited missions.') },
    { label: 'Appearance', value: user.theme[0].toUpperCase() + user.theme.slice(1), onClick: cycleTheme },
  ];

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Settings</h1>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: '1px solid var(--line-strong)' }}>
        <div className="avatar" style={{ width: 46, height: 46, fontSize: 17 }}>{user.initials}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>{user.name}</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>{user.email} · {user.plan}</div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        {rows.map((r) => (
          <div key={r.label} onClick={r.onClick} style={{ padding: '15px 0', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 17, cursor: r.onClick ? 'pointer' : 'default' }} className="setrow">
            <span>{r.label}</span>
            <span style={{ fontSize: 15, color: r.warn ? 'var(--warning-ink)' : 'var(--muted)' }}>{r.value}{r.onClick ? ' ›' : ''}</span>
          </div>
        ))}
      </div>

      {!user.calendarConnected && (
        <div style={{ marginTop: 26, padding: 16, borderLeft: '2px solid var(--warning)', background: 'var(--warning-wash)' }}>
          <div className="mono" style={{ color: 'var(--warning-ink)' }}>NEEDS ATTENTION</div>
          <div style={{ marginTop: 8, fontSize: 16, lineHeight: 1.45 }}>Novi couldn't connect to your calendar. Deadlines won't appear until it's reconnected.</div>
          <div className="link" style={{ marginTop: 11, fontSize: 15 }} onClick={reconnect}>Reconnect calendar</div>
        </div>
      )}

      <div style={{ marginTop: 26, fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={async () => { await logout(); nav('/welcome', { replace: true }); }}>Log out</div>
    </div>
  );
}
