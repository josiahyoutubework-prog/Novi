import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import './shell.css';

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'Missions', path: '/missions' },
  { label: 'Action Center', path: '/actions', badgeKey: 'actions' },
  { label: 'Intelligence', path: '/intelligence' },
  { label: 'Agents', path: '/agents' },
];

const SETTINGS_NAV = [
  { label: 'Autonomy', path: '/autonomy' },
  { label: 'Memory', path: '/memory' },
  { label: 'Settings', path: '/settings' },
];

const TABS = [
  { label: 'Home', path: '/' },
  { label: 'Missions', path: '/missions' },
  { label: 'Actions', path: '/actions', badge: true },
  { label: 'Novi', path: '/novi' },
];

export default function Shell() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = useStore((s) => s.user);
  const missions = useStore((s) => s.missions);
  const actions = useStore((s) => s.actions);
  const hasActions = actions.length > 0;

  const isActive = (path: string) =>
    path === '/' ? loc.pathname === '/' : loc.pathname === path || loc.pathname.startsWith(path + '/');

  const tabActive = (path: string) => {
    if (path === '/') return loc.pathname === '/';
    if (path === '/novi') return ['/novi', '/intelligence', '/agents', '/autonomy', '/memory', '/settings'].some((p) => loc.pathname.startsWith(p));
    return loc.pathname === path || loc.pathname.startsWith(path + '/');
  };

  const activeMissions = missions.filter((m) => m.status !== 'complete');

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Novi</div>
        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <div key={n.path} className={`sidebar-row${isActive(n.path) ? ' active' : ''}`} onClick={() => nav(n.path)}>
              <span>{n.label}</span>
              {n.badgeKey === 'actions' && hasActions && <span className="sidebar-badge" />}
            </div>
          ))}
        </nav>

        <div className="sidebar-label">ACTIVE</div>
        <div className="sidebar-nav" style={{ marginTop: 10 }}>
          {activeMissions.map((m) => (
            <div key={m.id} className={`sidebar-row mission${loc.pathname === `/missions/${m.id}` ? ' active' : ''}`} onClick={() => nav(`/missions/${m.id}`)}>
              <span>{m.title}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-label">SETTINGS</div>
        <div className="sidebar-nav" style={{ marginTop: 10 }}>
          {SETTINGS_NAV.map((n) => (
            <div key={n.path} className={`sidebar-row${isActive(n.path) ? ' active' : ''}`} onClick={() => nav(n.path)}>
              <span>{n.label}</span>
              {n.path === '/settings' && !user?.calendarConnected && <span className="sidebar-badge" />}
            </div>
          ))}
        </div>

        <div className="sidebar-foot" onClick={() => nav('/settings')} style={{ cursor: 'pointer' }}>
          <div className="avatar">{user?.initials}</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>{user?.name}</div>
        </div>
      </aside>

      <div className="content">
        <Outlet />
      </div>

      <nav className="tabbar">
        {TABS.map((t) => (
          <div key={t.path} className={`tab${tabActive(t.path) ? ' active' : ''}`} onClick={() => nav(t.path)}>
            {t.label.toUpperCase()}
            {t.badge && hasActions && <span className="tab-badge" />}
          </div>
        ))}
      </nav>
    </div>
  );
}
