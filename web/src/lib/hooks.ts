import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import type { Mission, Action, Intel, Agent, ActivityItem, Forgotten } from '../types';

export interface MissionDetail {
  mission: Mission;
  actions: Action[];
  intelligence: Intel[];
  agents: Agent[];
  activity: ActivityItem[];
  forgotten: Forgotten[];
}

export function useMissionDetail(id: string | undefined) {
  const [data, setData] = useState<MissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const d = await api.get<MissionDetail>(`/missions/${id}`);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { data, error, reload: load, setData };
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Format a plain "YYYY-MM-DD" date without timezone drift.
export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-US', opts);
}
