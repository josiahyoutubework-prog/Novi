import { useState } from 'react';
import { useStore } from '../store';

export default function ConfirmSheet() {
  const c = useStore((s) => s.confirmation);
  const clear = useStore((s) => s.clearConfirm);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState('');

  if (!c) return null;

  const confirm = async () => {
    setBusy(true);
    try { await c.onConfirm(); } finally { setBusy(false); setEditing(false); clear(); }
  };
  const cancel = () => { setEditing(false); clear(); };

  return (
    <div
      onClick={cancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(36,33,28,0.35)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        animation: 'fadein .16s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise"
        style={{
          background: 'var(--bg)', borderRadius: '24px 24px 0 0', padding: '28px 28px max(40px, env(safe-area-inset-bottom))',
          maxWidth: 460, width: '100%', margin: '0 auto', boxSizing: 'border-box', color: 'var(--ink)',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--line-strong)', margin: '0 auto' }} />
        <div className="mono" style={{ marginTop: 24, color: 'var(--accent)' }}>{c.eyebrow}</div>
        <div style={{ marginTop: 12, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{c.question}</div>

        {c.message && (
          <div style={{ marginTop: 18, padding: 18, background: 'var(--hover)', borderRadius: 14, fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            {c.message.to && <div style={{ fontSize: 13, color: 'var(--muted)' }}>To · {c.message.to}</div>}
            {editing ? (
              <textarea
                autoFocus
                value={body || c.message.body}
                onChange={(e) => setBody(e.target.value)}
                style={{ marginTop: 12, width: '100%', minHeight: 96, resize: 'vertical', border: '1px solid var(--line-strong)', borderRadius: 10, padding: 10, background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, lineHeight: 1.5 }}
              />
            ) : (
              <div style={{ marginTop: c.message.to ? 12 : 0 }}>{body || c.message.body}</div>
            )}
          </div>
        )}

        {c.disclosures && c.disclosures.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, color: 'var(--muted)' }}>
            {c.disclosures.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 9 }}><span>·</span>{d}</div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={cancel} disabled={busy}>{c.cancelLabel || 'Cancel'}</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirm} disabled={busy}>{busy ? 'Sending…' : c.confirmLabel}</button>
        </div>

        {c.message && (
          <div className="link" style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: editing ? 'var(--accent)' : 'var(--muted)' }} onClick={() => setEditing((e) => !e)}>
            {editing ? 'Done editing' : (c.editLabel || 'Edit before sending')}
          </div>
        )}
      </div>
    </div>
  );
}
