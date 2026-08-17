import { create } from 'zustand';
import { api, getToken, setToken } from './lib/api';
import type {
  User, Mission, Action, Intel, Agent, MemoryItem, AutonomyLevel, Fitness, FitnessSettings,
} from './types';

// A pending consequential action awaiting confirmation via the bottom sheet.
export interface Confirmation {
  eyebrow: string;
  question: string;
  message?: { to?: string; body: string };
  disclosures?: string[];
  confirmLabel: string;
  cancelLabel?: string;
  editLabel?: string;
  onConfirm: () => void | Promise<void>;
}

// A transient toast.
export interface Toast { id: number; text: string; }

interface State {
  user: User | null;
  booted: boolean;
  missions: Mission[];
  actions: Action[];
  intelligence: Intel[];
  agents: Agent[];
  memory: MemoryItem[];
  fitness: Fitness | null;
  alarmActive: boolean;
  alarmKind: 'alarm' | 'now';
  confirmation: Confirmation | null;
  toasts: Toast[];

  boot: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  refreshCore: () => Promise<void>;
  resolveAction: (id: string, choice?: string) => Promise<void>;
  activateAgent: (id: string, missionId?: string) => Promise<void>;

  setAutonomy: (level: AutonomyLevel) => Promise<void>;
  updateSettings: (patch: Partial<Pick<User, 'theme' | 'notifications' | 'calendarConnected' | 'allowedCategories' | 'mustAskCategories'>>) => Promise<void>;

  loadFitness: () => Promise<void>;
  saveFitness: (patch: Partial<FitnessSettings>) => Promise<void>;
  completeChallenge: (reps: number, kind: 'alarm' | 'now') => Promise<void>;
  triggerAlarm: (kind?: 'alarm' | 'now') => void;
  dismissAlarm: () => void;

  requireConfirm: (c: Confirmation) => void;
  clearConfirm: () => void;
  toast: (text: string) => void;
  dismissToast: (id: number) => void;

  applyTheme: () => void;
}

let toastSeq = 1;

export const useStore = create<State>((set, get) => ({
  user: null,
  booted: false,
  missions: [],
  actions: [],
  intelligence: [],
  agents: [],
  memory: [],
  fitness: null,
  alarmActive: false,
  alarmKind: 'alarm',
  confirmation: null,
  toasts: [],

  boot: async () => {
    if (!getToken()) { set({ booted: true }); return; }
    try {
      const { user } = await api.get<{ user: User }>('/me');
      set({ user });
      get().applyTheme();
      await get().refreshCore();
    } catch {
      setToken(null);
    } finally {
      set({ booted: true });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    setToken(token);
    set({ user });
    get().applyTheme();
    await get().refreshCore();
  },

  signup: async (name, email, password) => {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/signup', { name, email, password });
    setToken(token);
    set({ user });
    get().applyTheme();
    await get().refreshCore();
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setToken(null);
    set({ user: null, missions: [], actions: [], intelligence: [], agents: [], memory: [] });
  },

  refreshCore: async () => {
    const [m, a, i, ag, mem] = await Promise.all([
      api.get<{ missions: Mission[] }>('/missions'),
      api.get<{ actions: Action[] }>('/actions'),
      api.get<{ intelligence: Intel[] }>('/intelligence'),
      api.get<{ agents: Agent[] }>('/agents'),
      api.get<{ memory: MemoryItem[] }>('/memory'),
    ]);
    set({ missions: m.missions, actions: a.actions, intelligence: i.intelligence, agents: ag.agents, memory: mem.memory });
    get().loadFitness().catch(() => {});
  },

  loadFitness: async () => {
    const f = await api.get<Fitness>('/fitness');
    set({ fitness: f });
  },

  saveFitness: async (patch) => {
    const f = await api.patch<Fitness>('/fitness', patch);
    set({ fitness: f });
  },

  completeChallenge: async (reps, kind) => {
    const f = await api.post<Fitness>('/fitness/complete', { reps, kind });
    set({ fitness: f });
  },

  triggerAlarm: (kind = 'alarm') => set({ alarmActive: true, alarmKind: kind }),
  dismissAlarm: () => set({ alarmActive: false }),

  resolveAction: async (id, choice) => {
    await api.post(`/actions/${id}/resolve`, { choice });
    set({ actions: get().actions.filter((x) => x.id !== id) });
    // Refresh missions so status notes / progress reflect the resolution.
    const { missions } = await api.get<{ missions: Mission[] }>('/missions');
    set({ missions });
  },

  activateAgent: async (id, missionId) => {
    const { agent } = await api.post<{ agent: Agent }>(`/agents/${id}/activate`, { missionId });
    set({ agents: get().agents.map((a) => (a.id === id ? agent : a)) });
  },

  setAutonomy: async (level) => {
    const { user } = await api.patch<{ user: User }>('/settings', { autonomyLevel: level });
    set({ user });
  },

  updateSettings: async (patch) => {
    const { user } = await api.patch<{ user: User }>('/settings', patch);
    set({ user });
    get().applyTheme();
  },

  requireConfirm: (c) => set({ confirmation: c }),
  clearConfirm: () => set({ confirmation: null }),

  toast: (text) => {
    const id = toastSeq++;
    set({ toasts: [...get().toasts, { id, text }] });
    setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  applyTheme: () => {
    const theme = get().user?.theme ?? 'system';
    const root = document.documentElement;
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  },
}));

// Keep system theme in sync with OS changes.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const s = useStore.getState();
  if (s.user?.theme === 'system' || !s.user) s.applyTheme();
});
