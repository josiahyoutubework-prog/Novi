import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { actionInk } from '../lib/status';
import type { Action } from '../types';

export default function ActionCenter() {
  const nav = useNavigate();
  const actions = useStore((s) => s.actions);
  const user = useStore((s) => s.user);
  const resolveAction = useStore((s) => s.resolveAction);
  const requireConfirm = useStore((s) => s.requireConfirm);
  const toast = useStore((s) => s.toast);

  const mustAsk = (category: string) => user?.mustAskCategories.includes(category) ?? true;

  const verbLabel: Record<Action['kind'], string> = { approve: 'APPROVE', decide: 'DECIDE', review: 'REVIEW', confirm: 'CONFIRM' };

  const send = (a: Action) => {
    const doSend = () => resolveAction(a.id, 'Sent').then(() => toast('Sent. Novi logged it and moved the mission forward.'));
    if (a.draft && mustAsk(a.category)) {
      requireConfirm({
        eyebrow: 'READY TO SEND',
        question: a.title.replace(/\?$/, '') + '?',
        message: { to: a.draft.to, body: a.draft.body },
        disclosures: a.draft.disclosures,
        confirmLabel: 'Send',
        onConfirm: doSend,
      });
    } else {
      // Autopilot allows this category — Novi may act, but still logs it.
      doSend();
    }
  };

  const readDraft = (a: Action) => {
    if (!a.draft) return;
    requireConfirm({
      eyebrow: 'DRAFT',
      question: a.title.replace(/\?$/, '') + '?',
      message: { to: a.draft.to, body: a.draft.body },
      disclosures: a.draft.disclosures,
      confirmLabel: 'Send',
      onConfirm: () => resolveAction(a.id, 'Sent').then(() => toast('Sent.')),
    });
  };

  const decide = (a: Action, choice: string) => resolveAction(a.id, choice).then(() => toast(`Novi will prioritise ${choice}.`));
  const confirm = (a: Action, choice: string) => resolveAction(a.id, choice).then(() => toast(choice.startsWith('Yes') ? 'Kept as is.' : 'Noted — Novi will ask what to change.'));
  const review = (a: Action) => resolveAction(a.id, 'Reviewed').then(() => toast('Marked as reviewed.'));

  return (
    <div className="screen">
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Action Center</h1>
      <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        {actions.length === 0 ? 'Nothing needs your judgement right now. Everything else Novi is handling.' : `${countLabel(actions.length)} need your judgement. Everything else Novi handled.`}
      </div>

      <div style={{ marginTop: 28 }}>
        {actions.map((a, i, arr) => (
          <div key={a.id} style={{ padding: '18px 0', borderTop: '1px solid var(--line-strong)', borderBottom: i === arr.length - 1 ? '1px solid var(--line-strong)' : undefined }}>
            <div className="mono" style={{ color: actionInk(a.kind) }}>{verbLabel[a.kind]}</div>
            <div style={{ marginTop: 9, fontSize: 18, fontWeight: 500, lineHeight: 1.35 }}>{a.title}</div>
            {a.subtitle && <div style={{ marginTop: 5, fontSize: 14, color: 'var(--muted)' }}>{a.subtitle}</div>}

            {a.kind === 'approve' && (
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button className="btn btn-primary sm" onClick={() => send(a)}>Send</button>
                {a.draft && <button className="btn btn-secondary sm" onClick={() => readDraft(a)}>Read draft</button>}
              </div>
            )}
            {a.kind === 'decide' && (
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {a.options.map((o) => <button key={o} className="chip sm" onClick={() => decide(a, o)}>{o}</button>)}
              </div>
            )}
            {a.kind === 'confirm' && (
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {a.options.map((o) => <button key={o} className="chip sm" onClick={() => confirm(a, o)}>{o}</button>)}
              </div>
            )}
            {a.kind === 'review' && (
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary sm" onClick={() => review(a)}>Mark reviewed</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        Novi completed 9 actions this week without asking.{' '}
        <span className="link" onClick={() => nav('/intelligence')}>See what it did</span>
      </div>
    </div>
  );
}

function countLabel(n: number) {
  const words = ['Zero', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things', 'Six things'];
  return words[n] ?? `${n} things`;
}
