import type { ReactNode } from 'react';

// Centered single-column frame for auth + full-screen moments. Mirrors the
// mobile screen padding (96px top on auth) but stays comfortable on desktop.
export default function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%', maxWidth: 402, boxSizing: 'border-box',
          padding: 'max(64px, env(safe-area-inset-top)) 28px 40px',
          display: 'flex', flexDirection: 'column', minHeight: '100dvh',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, placeholder, type = 'text', focus, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; focus?: boolean; autoFocus?: boolean;
}) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em' }}>{label}</div>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: 9, width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontSize: 17, color: 'var(--ink)', padding: 0,
        }}
      />
      <div style={{ marginTop: 10, height: 1, background: focus ? 'var(--accent)' : 'var(--line-strong)' }} />
    </div>
  );
}
