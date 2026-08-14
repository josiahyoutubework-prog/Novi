import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AuthFrame, { Field } from '../../components/AuthFrame';

export default function SignUp() {
  const nav = useNavigate();
  const signup = useStore((s) => s.signup);
  const login = useStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const canContinue = /\S+@\S+\.\S+/.test(email);

  const go = async () => {
    if (!canContinue || busy) return;
    setBusy(true); setErr('');
    try {
      await signup(name.trim() || 'You', email.trim(), 'welcome-to-novi');
      nav('/onboarding', { replace: true });
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
      setErr('Could not open the demo account. Use email to continue.');
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <div className="eyebrow" style={{ letterSpacing: '0.22em' }}>NOVI</div>
      <div style={{ marginTop: 64, fontSize: 34, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Turn goals into outcomes.</div>
      <div style={{ marginTop: 14, fontSize: 17, lineHeight: 1.5, color: 'var(--muted)' }}>Tell Novi what you want to accomplish. Novi works out the rest.</div>

      <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-dark" onClick={sso}>Continue with Apple</button>
        <button className="btn btn-secondary" onClick={sso}>Continue with Google</button>
      </div>

      <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="hairline" style={{ flex: 1 }} />
        <div className="mono" style={{ color: 'var(--muted-2)' }}>OR</div>
        <div className="hairline" style={{ flex: 1 }} />
      </div>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="NAME" value={name} onChange={setName} placeholder="Alex Mercer" autoFocus />
        <Field label="EMAIL" value={email} onChange={setEmail} placeholder="you@example.com" type="email" focus={canContinue} />
      </div>

      {err && <div style={{ marginTop: 14, fontSize: 14, color: 'var(--warning-ink)' }}>{err}</div>}

      <button className={`btn ${canContinue ? 'btn-primary' : 'disabled'}`} style={{ marginTop: 20 }} onClick={go} disabled={!canContinue || busy}>
        {busy ? 'Creating your account…' : 'Continue'}
      </button>

      <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
        By continuing you agree to the terms. Novi never acts on your behalf without permission.
      </div>
      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 15, color: 'var(--muted)' }}>
        Already have an account? <span className="link" onClick={() => nav('/login')}>Log in</span>
      </div>
    </AuthFrame>
  );
}
