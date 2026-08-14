import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import AuthFrame, { Field } from '../../components/AuthFrame';

export default function Recover() {
  const nav = useNavigate();
  const [email, setEmail] = useState('alex@mercer.co');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const canSend = /\S+@\S+\.\S+/.test(email);

  const send = async () => {
    if (!canSend || busy) return;
    setBusy(true);
    try { await api.post('/auth/recover', { email }); setSent(true); } finally { setBusy(false); }
  };

  return (
    <AuthFrame>
      <div style={{ fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={() => nav('/login')}>Back to log in</div>
      <div style={{ marginTop: 52, fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
        {sent ? 'Check your inbox' : "Let's get you back in"}
      </div>
      <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55, color: 'var(--ink-3)' }}>
        {sent
          ? `We've sent a sign-in link to ${email}. It logs you straight in — no new password needed.`
          : "Enter the email you signed up with. We'll send a link that logs you straight in, no new password needed."}
      </div>

      {!sent && (
        <>
          <div style={{ marginTop: 40 }}>
            <Field label="EMAIL" value={email} onChange={setEmail} type="email" focus={canSend} autoFocus />
          </div>
          <button className={`btn ${canSend ? 'btn-primary' : 'disabled'}`} style={{ marginTop: 28 }} onClick={send} disabled={!canSend || busy}>
            {busy ? 'Sending…' : 'Send the link'}
          </button>
        </>
      )}

      {sent && (
        <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => nav('/login')}>Back to log in</button>
      )}

      <div style={{ marginTop: 40, padding: 18, border: '1px solid var(--line-strong)', borderRadius: 14 }}>
        <div className="mono">WHILE YOU'RE OUT</div>
        <div style={{ marginTop: 9, fontSize: 16, lineHeight: 1.5 }}>
          Your missions keep running. Novi is still watching your job boards and listings, and nothing will be sent without you.
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        No email after a minute? Check spam, or <span className="link" onClick={() => setEmail('')}>try another address</span>.
      </div>
    </AuthFrame>
  );
}
