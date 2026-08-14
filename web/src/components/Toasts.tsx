import { useStore } from '../store';

export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 'max(88px, calc(env(safe-area-inset-bottom) + 88px))', left: 0, right: 0, zIndex: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
      {toasts.map((t) => (
        <div key={t.id} className="rise" style={{ background: 'var(--ink)', color: 'var(--ink-fill-text)', padding: '12px 18px', borderRadius: 22, fontSize: 14, fontWeight: 500, maxWidth: 'min(90vw, 420px)', boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
