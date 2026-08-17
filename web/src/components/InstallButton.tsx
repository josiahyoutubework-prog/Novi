import { useInstall } from '../lib/pwa';
import { useStore } from '../store';

// Shows an "Install Novi" button when the browser can install the PWA, an
// iOS Share hint on iPhone/iPad, and nothing once Novi is already installed.
export default function InstallButton({ compact }: { compact?: boolean }) {
  const { canInstall, install, ios, standalone } = useInstall();
  const toast = useStore((s) => s.toast);

  if (standalone) return null;

  if (canInstall) {
    return (
      <button
        className={`btn btn-secondary${compact ? ' inline' : ''}`}
        style={{ marginTop: compact ? 0 : 12 }}
        onClick={async () => { const ok = await install(); if (ok) toast('Installing Novi to your home screen.'); }}
      >
        Install Novi
      </button>
    );
  }

  if (ios) {
    return (
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, textAlign: compact ? 'left' : 'center' }}>
        To install: tap the <strong>Share</strong> icon, then <strong>Add to Home Screen</strong>.
      </div>
    );
  }

  return null;
}
