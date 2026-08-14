import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import type { ChatMessage, WhatMoved } from '../types';
import './screens.css';

const toneColor: Record<WhatMoved['tone'], string> = {
  success: 'var(--success-ink)', warning: 'var(--warning-ink)', accent: 'var(--accent)', neutral: 'var(--muted)',
};

export default function Chat() {
  const { id } = useParams();
  const nav = useNavigate();
  const missions = useStore((s) => s.missions);
  const mission = missions.find((m) => m.id === id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.get<{ messages: ChatMessage[] }>(`/missions/${id}/chat`).then((d) => setMessages(d.messages));
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  const send = async () => {
    const t = text.trim();
    if (!t || busy || !id) return;
    setText('');
    setMessages((m) => [...m, { id: 'tmp-' + Date.now(), role: 'user', text: t, whatMoved: [] }]);
    setBusy(true);
    try {
      const { reply } = await api.post<{ reply: ChatMessage }>(`/missions/${id}/chat`, { text: t });
      setMessages((m) => [...m, reply]);
    } finally { setBusy(false); }
  };

  const suggestions = ['Can I still make it on time?', "What's the biggest risk?", 'What should I focus on?'];

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow">ASK NOVI</div>
        {mission && <div className="status-chip" style={{ color: 'var(--muted)', borderColor: 'var(--line-strong)' }}>{mission.title.split(' ').slice(-1)[0].toUpperCase()}</div>}
      </div>

      <div style={{ flex: 1, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {messages.map((m) => m.role === 'user' ? (
          <div key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '80%', padding: '13px 17px', borderRadius: '20px 20px 6px 20px', background: 'var(--ink)', color: 'var(--ink-fill-text)', fontSize: 16, lineHeight: 1.4 }}>{m.text}</div>
        ) : (
          <div key={m.id} className="fadein">
            <div style={{ fontSize: 17, lineHeight: 1.5 }}>{m.text}</div>
            {m.whatMoved.length > 0 && (
              <div style={{ marginTop: 14, padding: '14px 16px', border: '1px solid var(--line-strong)', borderRadius: 14 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em' }}>WHAT MOVED</div>
                {m.whatMoved.map((w, i) => (
                  <div key={i} style={{ marginTop: i === 0 ? 9 : 7, display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                    <span>{w.label}</span><span style={{ color: toneColor[w.tone] }}>{w.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <button className="btn btn-primary sm" onClick={() => nav(`/missions/${id}`)}>View revised plan</button>
              <button className="btn btn-secondary sm" onClick={() => useStore.getState().toast('Novi bases this on your dates, saved facts and the current market — never on hidden reasoning.')}>Why?</button>
            </div>
          </div>
        ))}
        {busy && <div className="fadein" style={{ display: 'flex', gap: 8, color: 'var(--muted)', fontSize: 15 }}><span className="spin" style={{ width: 14, height: 14 }} /> Novi is thinking…</div>}
        <div ref={endRef} />
      </div>

      {messages.length <= 2 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {suggestions.map((s) => <button key={s} className="chip sm" onClick={() => { setText(s); }}>{s}</button>)}
        </div>
      )}

      <div style={{ paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Ask about this mission…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--ink)' }}
        />
        <button
          onClick={send}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line-stronger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: text.trim() ? 'var(--accent)' : 'var(--muted)' }}
        >↑</button>
      </div>
    </div>
  );
}
