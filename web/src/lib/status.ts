import type { MissionStatus, PhaseStatus, IntelKind } from '../types';

export const missionLabel: Record<MissionStatus, string> = {
  on_track: 'ON TRACK', at_risk: 'AT RISK', behind: 'BEHIND', blocked: 'BLOCKED', complete: 'COMPLETE',
};

// Returns a CSS color variable expression for a mission status.
export function missionColor(s: MissionStatus): string {
  switch (s) {
    case 'on_track': return 'var(--success)';
    case 'complete': return 'var(--muted)';
    case 'at_risk':
    case 'behind': return 'var(--warning)';
    case 'blocked': return 'var(--muted)';
  }
}
export function missionInk(s: MissionStatus): string {
  switch (s) {
    case 'on_track': return 'var(--success-ink)';
    case 'at_risk':
    case 'behind': return 'var(--warning-ink)';
    default: return 'var(--muted)';
  }
}

export function phaseColor(s: PhaseStatus): string {
  switch (s) {
    case 'complete': return 'var(--success)';
    case 'in_progress': return 'var(--accent)';
    case 'behind': return 'var(--warning)';
    case 'not_started': return 'transparent';
  }
}
export function phaseLabel(s: PhaseStatus): string {
  switch (s) {
    case 'complete': return 'Complete';
    case 'in_progress': return 'In progress';
    case 'behind': return 'Behind';
    case 'not_started': return 'Not started';
  }
}
export function phaseInk(s: PhaseStatus): string {
  switch (s) {
    case 'complete': return 'var(--muted)';
    case 'in_progress': return 'var(--accent)';
    case 'behind': return 'var(--warning-ink)';
    case 'not_started': return 'var(--muted-2)';
  }
}

// Intelligence border + eyebrow colour by kind.
export function intelColor(k: IntelKind): string {
  switch (k) {
    case 'risk': return 'var(--warning)';
    case 'opportunity': return 'var(--success)';
    default: return 'var(--line-stronger)';
  }
}
export function intelInk(k: IntelKind): string {
  switch (k) {
    case 'risk': return 'var(--warning-ink)';
    case 'opportunity': return 'var(--success-ink)';
    default: return 'var(--muted)';
  }
}

// Action verb colour by kind.
export function actionInk(kind: string): string {
  switch (kind) {
    case 'approve': return 'var(--accent)';
    case 'decide': return 'var(--warning-ink)';
    default: return 'var(--muted)';
  }
}
