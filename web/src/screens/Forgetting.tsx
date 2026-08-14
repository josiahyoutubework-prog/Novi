import { useParams, useNavigate } from 'react-router-dom';
import { useMissionDetail } from '../lib/hooks';
import { api } from '../lib/api';
import { useStore } from '../store';
import './screens.css';

export default function Forgetting() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, reload } = useMissionDetail(id);
  const toast = useStore((s) => s.toast);

  if (!data) return <div className="screen"><div className="spin" /></div>;
  const { mission: m, forgotten } = data;

  const groups = Array.from(new Set(forgotten.map((f) => f.grouping)));
  const urgentGroups = groups.filter((g) => g !== 'LESS URGENT');
  const lessUrgent = forgotten.filter((f) => f.grouping === 'LESS URGENT');
  const pendingCore = forgotten.filter((f) => f.grouping !== 'LESS URGENT' && !f.added).length;

  const add = async (fid: string, title: string) => {
    await api.post(`/forgotten/${fid}/add`);
    toast(`Added "${title}" to ${m.title}`);
    reload();
  };
  const addAll = async () => {
    await api.post(`/missions/${m.id}/forgotten/add-all`);
    toast(`Added ${pendingCore} items to ${m.title}. Timeline recomputed.`);
    reload();
  };

  return (
    <div className="screen">
      <div className="back-link" onClick={() => nav(`/missions/${m.id}`)}>← {m.title}</div>
      <div className="eyebrow" style={{ marginTop: 16 }}>{m.title.toUpperCase()}</div>
      <h1 style={{ margin: '18px 0 0', fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
        Eight things you may have missed
      </h1>
      <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>
        Ordered by when they'd hurt. The first two are already close.
      </div>

      {urgentGroups.map((g) => (
        <div key={g} style={{ marginTop: 26 }}>
          <div className="mono" style={g === 'NEEDS A DECISION THIS MONTH' ? { color: 'var(--warning-ink)' } : undefined}>{g}</div>
          <div style={{ marginTop: 14 }}>
            {forgotten.filter((f) => f.grouping === g).map((f, i, arr) => (
              <div key={f.id} style={{ padding: '14px 0', borderTop: '1px solid var(--line)', borderBottom: i === arr.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 500 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>{f.reason}</div>
                </div>
                {f.added
                  ? <div style={{ fontSize: 14, color: 'var(--success-ink)', fontWeight: 500, paddingTop: 2 }}>Added ✓</div>
                  : <div className="link" style={{ fontSize: 14, paddingTop: 2 }} onClick={() => add(f.id, f.title)}>Add</div>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {lessUrgent.length > 0 && (
        <div style={{ marginTop: 20, fontSize: 15, color: 'var(--muted)' }}>{lessUrgent.length} more, less urgent</div>
      )}

      {pendingCore > 0 && (
        <button className="btn btn-dark" style={{ marginTop: 24 }} onClick={addAll}>Add all {pendingCore} to the mission</button>
      )}
      {pendingCore === 0 && (
        <div style={{ marginTop: 24, fontSize: 15, color: 'var(--success-ink)' }}>All the urgent items are on the mission. Novi recomputed the timeline.</div>
      )}
    </div>
  );
}
