export type MissionStatus = 'on_track' | 'at_risk' | 'behind' | 'blocked' | 'complete';
export type PhaseStatus = 'complete' | 'in_progress' | 'behind' | 'not_started';
export type ActionKind = 'approve' | 'decide' | 'review' | 'confirm';
export type IntelKind = 'risk' | 'opportunity' | 'dependency' | 'change';
export type AgentStatus = 'active' | 'suggested' | 'available';
export type AutonomyLevel = 'Assist' | 'Co-pilot' | 'Autopilot';

export interface User {
  id: string; name: string; email: string; plan: string; initials: string;
  autonomyLevel: AutonomyLevel;
  allowedCategories: string[];
  mustAskCategories: string[];
  theme: 'system' | 'light' | 'dark';
  calendarConnected: boolean;
  notifications: string;
}

export interface Phase { name: string; status: PhaseStatus; note: string; }
export interface HandlingItem { state: 'done' | 'active'; text: string; }
export interface WorkingItem { label: string; value: string; }

export interface Mission {
  id: string; title: string; outcome: string; targetDate: string | null; targetLabel: string;
  status: MissionStatus; progress: number; statusNote: string;
  phases: Phase[]; constraints: string; whatMatters: string;
  handling: HandlingItem[]; workingOn: WorkingItem[]; dependency: string; sort: number;
}

export interface Draft { to: string; body: string; disclosures: string[]; }
export interface Action {
  id: string; missionId: string | null; kind: ActionKind; title: string; subtitle: string;
  options: string[]; category: string; draft: Draft | null; status: string; resolution: string;
}

export interface Intel {
  id: string; missionId: string | null; kind: IntelKind; whenLabel: string;
  headline: string; detail: string; ctaLabel: string; read: boolean;
}

export interface Agent {
  id: string; missionId: string | null; name: string; status: AgentStatus;
  summary: string; description: string; does: string[]; needs: string[]; limitation: string;
}

export interface MemoryItem { id: string; category: string; text: string; learnedAt: string; }

export interface ActivityItem {
  id: string; missionId: string | null; actor: string; dateLabel: string;
  text: string; future: boolean; isToday: boolean;
}

export interface Forgotten { id: string; missionId: string | null; grouping: string; title: string; reason: string; added: boolean; }

export interface WhatMoved { label: string; value: string; tone: 'success' | 'warning' | 'accent' | 'neutral'; }
export interface ChatMessage { id: string; role: 'user' | 'novi'; text: string; whatMoved: WhatMoved[]; }

export interface Question { prompt: string; chips: string[]; }
export interface WorkingStep { text: string; sub: string; state: 'done' | 'active' | 'pending'; }
export interface Plan {
  title: string; outcome: string; target_date: string; target_label: string;
  phases: Phase[]; constraints: string; what_matters: string;
  working_on: WorkingItem[]; handling: HandlingItem[];
}
