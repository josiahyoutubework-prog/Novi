import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AuthFrame, { Field } from '../../components/AuthFrame';

export default function LogIn() {
  const nav = useNavigate();
  const login = useStore((s) => s.login);
  const missions = useStore((s) => s.missions);
  const [email, setEmail] = useState('alex@mercer.co');
  const [password, setPassword] = useState('password123');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const go = async () => {
    if (busy) return;
    setBusy(true); setErr('');
    try {
      await login(email.trim(), password);
      nav('/', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  };

  // Social sign-in opens the seeded demo account so the button is fully live.
  const sso = async () => {
    if (busy) return;
    setBusy(true); setErr('');
    try {
      await login('alex@mercer.co', 'password123');
      nav('/', { replace: true });
    } catch {
      setErr('Could not open the demo account.');
      setBusy(false);
    }
  };

  const running = missions.filter((m) => m.status !== 'complete').length;

  return (
    <AuthFrame>
      <div className="eyebrow" style={{ letterSpacing: '0.22em' }}>NOVI</div>
      <div style={{ marginTop: 60, fontSize: 32, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15 }}>Welcome back</div>
      <div style={{ marginTop: 12, fontSize: 16, color: 'var(--muted)', lineHeight: 1.5 }}>
        {running ? `${running} mission${running === 1 ? ' is' : 's are'} still running.` : 'Three missions are still running.'}
      </div>

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Field label="EMAIL" value={email} onChange={setEmail} type="email" />
        <Field label="PASSWORD" value={password} onChange={setPassword} type="password" />
      </div>

      {err && <div style={{ marginTop: 16, fontSize: 14, color: 'var(--warning-ink)' }}>{err}</div>}

      <button className="btn btn-dark" style={{ marginTop: 28 }} onClick={go} disabled={busy}>{busy ? 'Signing you in…' : 'Log in'}</button>
      <div className="link" style={{ marginTop: 18, textAlign: 'center', fontSize: 15 }} onClick={() => nav('/recover')}>I've forgotten my password</div>

      <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="hairline" style={{ flex: 1 }} />
        <div className="mono" style={{ color: 'var(--muted-2)' }}>OR</div>
        <div className="hairline" style={{ flex: 1 }} />
      </div>
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-secondary" onClick={sso} disabled={busy}>Continue with Apple</button>
        <button className="btn btn-secondary" onClick={sso} disabled={busy}>Continue with Google</button>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center', fontSize: 15, color: 'var(--muted)' }}>
        New here? <span className="link" onClick={() => nav('/signup')}>Create an account</span>
      </div>
    </AuthFrame>
  );
}
