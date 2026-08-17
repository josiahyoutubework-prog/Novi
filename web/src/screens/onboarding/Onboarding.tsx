import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { api } from '../../lib/api';
import AuthFrame from '../../components/AuthFrame';
import { PhaseDotLine } from '../../components/ui';
import type { Question, WorkingStep, Plan } from '../../types';

type Step = 'capture' | 'understanding' | 'working' | 'plan';

export default function Onboarding() {
  const nav = useNavigate();
  const refreshCore = useStore((s) => s.refreshCore);
  const missionsCount = useStore((s) => s.missions.length);

  const [step, setStep] = useState<Step>('capture');
  const [intention, setIntention] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [steps, setSteps] = useState<WorkingStep[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  // ---- Capture --------------------------------------------------------
  const startUnderstanding = async () => {
    if (!intention.trim()) return;
    setBusy(true);
    try {
      const { questions, steps } = await api.post<{ questions: Question[]; steps: WorkingStep[] }>('/missions/clarify', { intention });
      setQuestions(questions);
      setSteps(steps);
      setStep('understanding');
    } finally { setBusy(false); }
  };

  // ---- Understanding --------------------------------------------------
  const answer = (a: string) => {
    const next = [...answers, a];
    setAnswers(next);
    setCustom('');
    if (qIndex + 1 >= Math.min(questions.length, 3)) startWorking(next);
    else setQIndex(qIndex + 1);
  };
  const skip = () => {
    if (qIndex + 1 >= Math.min(questions.length, 3)) startWorking(answers);
    else setQIndex(qIndex + 1);
  };

  // ---- Working (fetch plan, animate) ---------------------------------
  const startWorking = async (finalAnswers: string[]) => {
    setStep('working');
    const planReq = api.post<{ plan: Plan }>('/missions/plan', { intention, answers: finalAnswers });
    const [{ plan }] = await Promise.all([planReq, sleep(2600)]);
    setPlan(plan);
    setStep('plan');
  };

  // ---- Start the mission ---------------------------------------------
  const start = async () => {
    if (!plan) return;
    setBusy(true);
    try {
      const { mission } = await api.post<{ mission: { id: string } }>('/missions', { plan });
      await refreshCore();
      nav(`/missions/${mission.id}`, { replace: true });
    } finally { setBusy(false); }
  };

  return (
    <AuthFrame>
      {step === 'capture' && (
        <Capture value={intention} onChange={setIntention} onNext={startUnderstanding} busy={busy} canSkip={missionsCount > 0} onSkip={() => nav('/', { replace: true })} />
      )}
      {step === 'understanding' && (
        <Understanding
          questions={questions} qIndex={qIndex} answers={answers}
          custom={custom} setCustom={setCustom} onAnswer={answer} onSkip={skip}
        />
      )}
      {step === 'working' && <Working steps={steps} />}
      {step === 'plan' && plan && <PlanReveal plan={plan} onStart={start} onChange={setPlan} busy={busy} />}
    </AuthFrame>
  );
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ---- 01 · Goal capture ------------------------------------------------
function Capture({ value, onChange, onNext, busy, canSkip, onSkip }: {
  value: string; onChange: (v: string) => void; onNext: () => void; busy: boolean; canSkip: boolean; onSkip: () => void;
}) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow" style={{ letterSpacing: '0.22em' }}>NOVI</div>
        {canSkip && <div style={{ fontSize: 14, color: 'var(--muted)', cursor: 'pointer' }} onClick={onSkip}>Cancel</div>}
      </div>
      <div style={{ marginTop: 52, fontSize: 33, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>What are you working toward?</div>
      <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.5, color: 'var(--muted)' }}>In your own words. I'll work out what it takes.</div>

      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onNext(); }}
        placeholder="I want to move to Vancouver next summer"
        rows={2}
        style={{
          marginTop: 44, width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent',
          fontSize: 21, fontWeight: 500, lineHeight: 1.4, color: 'var(--ink)', padding: 0,
        }}
      />
      <div style={{ height: 1, background: 'var(--line-strong)' }} />

      <button className={`btn ${value.trim() ? 'btn-primary' : 'disabled'}`} style={{ marginTop: 24 }} onClick={onNext} disabled={!value.trim() || busy}>
        {busy ? 'Thinking…' : 'Continue'}
      </button>

      <div style={{ marginTop: 'auto', paddingTop: 26, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--muted)' }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--line-stronger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>◎</span>
        Or say it out loud
      </div>
    </>
  );
}

// ---- 02 · Understanding ----------------------------------------------
function Understanding({ questions, qIndex, answers, custom, setCustom, onAnswer, onSkip }: {
  questions: Question[]; qIndex: number; answers: string[]; custom: string;
  setCustom: (v: string) => void; onAnswer: (a: string) => void; onSkip: () => void;
}) {
  const total = Math.min(questions.length, 3);
  const q = questions[qIndex];
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="eyebrow">
        <div>UNDERSTANDING</div><div>{qIndex + 1} OF {total}</div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 5 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2, background: i <= qIndex ? 'var(--accent)' : 'var(--line-strong)' }} />
        ))}
      </div>

      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {questions.slice(0, qIndex).map((aq, i) => (
          <div key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.45 }}>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>{aq.prompt}</div>
              <div style={{ fontSize: 17, fontWeight: 500 }}>{answers[i]}</div>
            </div>
            <div className="hairline" style={{ marginTop: 22 }} />
          </div>
        ))}
      </div>

      <div className="rise" key={qIndex} style={{ marginTop: 34, fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{q.prompt}</div>
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {q.chips.map((c) => (
          <button key={c} className="chip" onClick={() => onAnswer(c)}>{c}</button>
        ))}
      </div>
      <input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && custom.trim()) onAnswer(custom.trim()); }}
        placeholder="Or type your own…"
        style={{ marginTop: 20, width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--ink)' }}
      />

      <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={onSkip}>Skip</div>
        <button className="btn btn-dark inline" onClick={() => (custom.trim() ? onAnswer(custom.trim()) : onSkip())}>Continue</button>
      </div>
    </>
  );
}

// ---- 17 · Novi is working --------------------------------------------
function Working({ steps }: { steps: WorkingStep[] }) {
  const [progress, setProgress] = useState(12);
  const [revealed, setRevealed] = useState(3);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(96, p + 6 + Math.random() * 6));
      setRevealed((r) => Math.min(steps.length, r + 1));
    }, 420);
    timer.current = id;
    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <>
      <div className="eyebrow accent">NOVI IS WORKING</div>
      <div style={{ marginTop: 20, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Building your mission</div>
      <div style={{ marginTop: 10, fontSize: 16, color: 'var(--muted)', lineHeight: 1.5 }}>This takes about a minute. You can close the app.</div>

      <div style={{ marginTop: 38, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 16 }}>
        {steps.map((s, i) => {
          const state = i < revealed - 1 ? 'done' : i === revealed - 1 ? 'active' : 'pending';
          return (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: state === 'pending' ? 0.4 : 1, transition: 'opacity .3s' }}>
              <span style={{ color: state === 'done' ? 'var(--success)' : state === 'active' ? 'var(--accent)' : 'var(--muted-2)' }}>
                {state === 'done' ? '✓' : state === 'active' ? '●' : '○'}
              </span>
              <div>
                <div style={{ fontWeight: state === 'active' ? 500 : 400 }}>{s.text}</div>
                {s.sub && state !== 'pending' && <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{s.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 40, height: 2, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width .4s ease-out' }} />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
        Novi shows what it did, never how it thinks. You'll see the finished plan before anything starts.
      </div>
    </>
  );
}

// ---- 03 · Novi's Plan (staggered reveal, editable) -------------------
function PlanReveal({ plan, onStart, onChange, busy }: { plan: Plan; onStart: () => void; onChange: (p: Plan) => void; busy: boolean }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <PlanEditor plan={plan} onChange={onChange} onDone={() => setEditing(false)} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="rise" style={{ animationDelay: '0ms' }}>
        <div className="eyebrow accent">NOVI'S PLAN</div>
        <div style={{ marginTop: 22, fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{plan.title}</div>
        <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)' }}>{plan.target_label}</div>
      </div>

      <div className="rise sect" style={{ animationDelay: '60ms' }}>
        <div className="mono">OUTCOME</div>
        <div style={{ marginTop: 7, fontSize: 17, lineHeight: 1.45 }}>{plan.outcome}</div>
      </div>

      <div className="rise sect" style={{ animationDelay: '120ms' }}>
        <div className="mono">{plan.phases.length === 5 ? 'FIVE PHASES' : `${plan.phases.length} PHASES`}</div>
        <div style={{ marginTop: 14 }}><PhaseDotLine phases={plan.phases} /></div>
      </div>

      <div className="rise sect" style={{ animationDelay: '180ms' }}>
        <div className="mono">CONSTRAINTS</div>
        <div style={{ marginTop: 6, fontSize: 15 }}>{plan.constraints}</div>
      </div>

      <div className="rise" style={{ animationDelay: '240ms', marginTop: 'auto', paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" onClick={onStart} disabled={busy}>{busy ? 'Starting…' : 'Start mission'}</button>
        <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={() => setEditing(true)}>Adjust the plan first</div>
      </div>
    </div>
  );
}

// Editable draft of the plan — rename the title, rewrite the outcome and
// constraints, edit/add/remove phases, then keep the changes.
function PlanEditor({ plan, onChange, onDone }: { plan: Plan; onChange: (p: Plan) => void; onDone: () => void }) {
  const [d, setD] = useState<Plan>(plan);
  const set = (patch: Partial<Plan>) => setD((p) => ({ ...p, ...patch }));
  const setPhase = (i: number, patch: Partial<Plan['phases'][number]>) =>
    setD((p) => ({ ...p, phases: p.phases.map((ph, j) => (j === i ? { ...ph, ...patch } : ph)) }));
  const removePhase = (i: number) => setD((p) => ({ ...p, phases: p.phases.filter((_, j) => j !== i) }));
  const addPhase = () => setD((p) => ({ ...p, phases: [...p.phases, { name: 'New phase', status: 'not_started', note: '' }] }));
  const save = () => { onChange({ ...d, title: d.title.trim() || plan.title }); onDone(); };

  const inputStyle = { width: '100%', border: '1px solid var(--line-strong)', borderRadius: 10, padding: '9px 11px', background: 'var(--bg)', color: 'var(--ink)', fontSize: 15, fontFamily: 'var(--font-ui)' } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="eyebrow accent">ADJUST THE PLAN</div>

      <div className="sect">
        <div className="mono">TITLE</div>
        <input value={d.title} onChange={(e) => set({ title: e.target.value })} style={{ ...inputStyle, marginTop: 8, fontSize: 18, fontWeight: 600 }} />
      </div>

      <div className="sect">
        <div className="mono">OUTCOME</div>
        <textarea value={d.outcome} onChange={(e) => set({ outcome: e.target.value })} rows={2} style={{ ...inputStyle, marginTop: 8, resize: 'vertical', lineHeight: 1.45 }} />
      </div>

      <div className="sect">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono">PHASES</div>
          <span className="link" style={{ fontSize: 13 }} onClick={addPhase}>+ Add phase</span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {d.phases.map((ph, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-2)', paddingTop: 11, width: 20 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input value={ph.name} onChange={(e) => setPhase(i, { name: e.target.value })} style={{ ...inputStyle, fontWeight: 500 }} />
                <input value={ph.note} onChange={(e) => setPhase(i, { note: e.target.value })} placeholder="Why it matters…" style={{ ...inputStyle, fontSize: 14, color: 'var(--muted)' }} />
              </div>
              {d.phases.length > 1 && (
                <button style={{ paddingTop: 10, color: 'var(--muted-2)', fontSize: 18, lineHeight: 1 }} onClick={() => removePhase(i)} aria-label="Remove phase">×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sect">
        <div className="mono">CONSTRAINTS</div>
        <input value={d.constraints} onChange={(e) => set({ constraints: e.target.value })} style={{ ...inputStyle, marginTop: 8 }} />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" onClick={save}>Keep changes</button>
        <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--muted)', cursor: 'pointer' }} onClick={onDone}>Discard</div>
      </div>
    </div>
  );
}
