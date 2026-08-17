import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

// Catches render errors anywhere below it and shows a calm recovery screen
// instead of a blank page — errors state what happened and offer one action.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[novi] render error:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--ink)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 28 }}>
        <div style={{ maxWidth: 402, width: '100%' }}>
          <div className="eyebrow warn">SOMETHING BROKE</div>
          <div style={{ marginTop: 16, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            This screen hit an error.
          </div>
          <div style={{ marginTop: 12, fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.55 }}>
            Your data is safe. Reloading usually clears it.
          </div>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => { window.location.href = '/'; }}>
            Reload Novi
          </button>
        </div>
      </div>
    );
  }
}
