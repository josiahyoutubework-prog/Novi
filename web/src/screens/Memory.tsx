import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../lib/api';
import type { MemoryItem } from '../types';

export default function Memory() {
  const nav = useNavigate();
  const memory = useStore((s) => s.memory);
  const refreshCore = useStore((s) => s.refreshCore);
  const requireConfirm = useStore((s) => s.requireConfirm);
  const toast = useStore((s) => s.toast);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [dismissedInferred, setDismissedInferred] = useState(false);

  const inferred = memory.find((m) => m.learnedAt);
  const categories = Array.from(new Set(memory.map((m) => m.category)));

  const startEdit = (m: MemoryItem) => { setEditing(m.id); setDraft(m.text); };
  const saveEdit = async (m: MemoryItem) => {
    await api.patch(`/memory/${m.id}`, { text: draft.trim() || m.text });
    setEditing(null);
    await refreshCore();
  };
  const remove = async (m: MemoryItem) => {
    await api.del(`/memory/${m.id}`);
    await refreshCore();
    toast('Forgotten.');
  };
  const deleteAll = () => requireConfirm({
    eyebrow: 'DELETE EVERYTHING',
    question: 'Forget everything Novi remembers about you?',
    confirmLabel: 'Delete all',
    onConfirm: async () => { await api.del('/memory'); await refreshCore(); toast('Novi cleared its memory.'); },
  });

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>What Novi knows</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        {memory.length} things, learned from what you've told it. Edit or delete anything.
      </div>

      {categories.map((cat) => (
        <div key={cat} style={{ marginTop: 24 }}>
          <div className="mono">{cat}</div>
          <div style={{ marginTop: 12 }}>
            {memory.filter((m) => m.category === cat).map((m, i, arr) => (
              <div key={m.id} style={{ padding: '14px 0', borderTop: '1px solid var(--line-strong)', borderBottom: i === arr.length - 1 ? '1px solid var(--line-strong)' : undefined, display: 'flex', gap: 14, alignItems: 'center' }}>
                {editing === m.id ? (
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(m); if (e.key === 'Escape') setEditing(null); }}
                    style={{ flex: 1, border: 'none', outline: 'none', borderBottom: '1px solid var(--accent)', background: 'transparent', fontSize: 16, color: 'var(--ink)', padding: '2px 0' }} />
                ) : (
                  <div style={{ flex: 1, fontSize: 16 }}>{m.text}</div>
                )}
                {editing === m.id ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span className="link" style={{ fontSize: 14 }} onClick={() => saveEdit(m)}>Save</span>
                    <span style={{ fontSize: 14, color: 'var(--muted-2)', cursor: 'pointer' }} onClick={() => remove(m)}>Delete</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--muted-2)', cursor: 'pointer' }} onClick={() => startEdit(m)}>Edit</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {inferred && !dismissedInferred && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--line-strong)', borderRadius: 14 }}>
          <div style={{ fontSize: 16, lineHeight: 1.5 }}>Novi learned this on {inferred.learnedAt}: <span style={{ fontWeight: 500 }}>{inferred.text.charAt(0).toLowerCase() + inferred.text.slice(1)}.</span></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button className="chip sm" onClick={() => { setDismissedInferred(true); toast('Kept.'); }}>That's right</button>
            <button className="chip sm" onClick={() => { setDismissedInferred(true); remove(inferred); }}>Forget it</button>
          </div>
        </div>
      )}

      <div className="link" style={{ marginTop: 24, fontSize: 15 }} onClick={deleteAll}>Delete everything Novi remembers</div>
    </div>
  );
}
