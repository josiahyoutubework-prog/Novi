import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import AuthFrame from '../components/AuthFrame';
import { Check } from '../components/ui';

export default function Permission() {
  const nav = useNavigate();
  const updateSettings = useStore((s) => s.updateSettings);
  const toast = useStore((s) => s.toast);

  const connect = async () => {
    await updateSettings({ calendarConnected: true });
    toast('Calendar connected.');
    nav('/settings', { replace: true });
  };

  return (
    <AuthFrame>
      <div className="eyebrow">PERMISSION</div>
      <div style={{ marginTop: 20, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Novi would like to read your calendar</div>
      <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55, color: 'var(--ink-3)' }}>
        So it can schedule viewings around your actual week and warn you when a deadline collides with something.
      </div>

      <div className="sect">
        <div className="mono">NOVI WILL</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16 }}>
          <div style={{ display: 'flex', gap: 11 }}><Check />Read event times and titles</div>
          <div style={{ display: 'flex', gap: 11 }}><Check />Spot conflicts with mission deadlines</div>
        </div>
      </div>
      <div className="sect">
        <div className="mono">NOVI WILL NOT</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: 'var(--ink-2)' }}>
          <div style={{ display: 'flex', gap: 11 }}><Check tone="muted" />Create or move events without asking</div>
          <div style={{ display: 'flex', gap: 11 }}><Check tone="muted" />Invite anyone on your behalf</div>
          <div style={{ display: 'flex', gap: 11 }}><Check tone="muted" />Share your calendar with anyone</div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" onClick={connect}>Connect calendar</button>
        <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={() => nav(-1)}>Not now</div>
      </div>
    </AuthFrame>
  );
}
