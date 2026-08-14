// Novi's "intelligence": deterministic mission-plan generation and chat replies.
// This stands in for an LLM so the product is fully functional offline. It reads
// the user's plain-language intention and returns a structured Mission.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Turn a raw intention into a short mission title.
export function deriveTitle(intention) {
  let t = intention.trim().replace(/^(i want to|i'd like to|i would like to|help me|i need to|i'm trying to|im trying to)\s+/i, '');
  t = t.replace(/[.!?]+$/, '');
  if (t.length > 48) t = t.slice(0, 48).trim() + '…';
  return titleCase(t);
}

// Pick a phase template from keywords in the intention.
function phaseTemplate(intention) {
  const s = intention.toLowerCase();
  if (/(move|relocat|city|abroad)/.test(s)) {
    return {
      outcome: 'Settled in your new home with work and housing arranged.',
      phases: ['Research the market', 'Secure employment', 'Arrange housing', 'Fund the move', 'Make the move'],
      notes: ['Neighbourhoods, salaries, cost of living', 'Offer signed before housing is committed', 'Viewings, application, lease', 'Save the deposit and moving costs', 'Logistics, admin, arrival'],
    };
  }
  if (/(save|money|fund|\$|budget)/.test(s)) {
    return {
      outcome: 'The target amount saved by your date, with the pace on track.',
      phases: ['Set the target', 'Automate deposits', 'Trim recurring costs', 'Track the pace', 'Close the gap'],
      notes: ['A clear number and date', 'A fixed amount every month', 'Cancel what you do not use', 'Weekly check against target', 'Add extra if you fall behind'],
    };
  }
  if (/(job|career|hire|role|work)/.test(s)) {
    return {
      outcome: 'A signed offer for a role that fits your field and goals.',
      phases: ['Define what you want', 'Prepare materials', 'Apply and network', 'Interview', 'Negotiate and accept'],
      notes: ['Role, level, comp, location', 'CV, portfolio, references', 'Track applications and contacts', 'Prep and follow up', 'Compare and decide'],
    };
  }
  if (/(business|startup|launch|company)/.test(s)) {
    return {
      outcome: 'A live business with first customers and a repeatable offer.',
      phases: ['Validate the idea', 'Build the offer', 'Set up operations', 'Launch', 'Grow'],
      notes: ['Talk to real customers', 'A first version people pay for', 'Legal, banking, tools', 'Get to first sales', 'Repeat what works'],
    };
  }
  if (/(thesis|degree|study|exam|course|learn)/.test(s)) {
    return {
      outcome: 'The work finished and approved, on time.',
      phases: ['Plan the work', 'Do the core work', 'Review', 'Revise', 'Submit'],
      notes: ['Scope and schedule', 'The main body of work', 'Get feedback early', 'Act on the notes', 'Final checks and hand-in'],
    };
  }
  return {
    outcome: 'The outcome reached by your date, with the hard parts handled early.',
    phases: ['Understand the goal', 'Prepare', 'Do the work', 'Check progress', 'Finish'],
    notes: ['What "done" looks like', 'Gather what you need', 'The main effort', 'Adjust as you go', 'Complete and confirm'],
  };
}

// The "understanding" questions — never more than three.
export function clarifyingQuestions(intention) {
  const s = intention.toLowerCase();
  const dateQ = { prompt: 'When would you want this done?', chips: ['In 3 months', 'By next summer', 'End of the year', 'No fixed date'] };
  if (/(move|relocat)/.test(s)) {
    return [
      dateQ,
      { prompt: 'Would you move with a job already secured?', chips: ['Yes — that’s the plan', 'Open to either', 'No, after I arrive'] },
      { prompt: 'Anything I should take into account?', chips: ['Tight budget', 'Lease ends soon', 'Moving with a partner', 'Bringing a pet'] },
    ];
  }
  if (/(save|money|fund|\$)/.test(s)) {
    return [
      dateQ,
      { prompt: 'How much are you aiming for?', chips: ['$5,000', '$10,000', '$25,000', 'Something else'] },
      { prompt: 'Anything I should take into account?', chips: ['Irregular income', 'Existing debts', 'A big cost coming up'] },
    ];
  }
  return [
    dateQ,
    { prompt: 'What does success look like?', chips: ['A clear finish line', 'Steady progress', 'One big milestone'] },
    { prompt: 'Anything I should take into account?', chips: ['Tight budget', 'Limited time', 'Doing this with others'] },
  ];
}

// Resolve a target date from an answer string (best effort).
function resolveTarget(answers) {
  const joined = (answers || []).join(' ').toLowerCase();
  const d = new Date();
  if (/3 month/.test(joined)) d.setMonth(d.getMonth() + 3);
  else if (/summer/.test(joined)) { d.setFullYear(d.getFullYear() + 1); d.setMonth(5, 15); }
  else if (/end of the year|year/.test(joined)) { d.setMonth(11, 31); }
  else { d.setMonth(d.getMonth() + 6); }
  return d;
}

export function buildPlan(intention, answers) {
  const tpl = phaseTemplate(intention);
  const target = resolveTarget(answers);
  const targetDate = target.toISOString().slice(0, 10);
  const targetLabel = `Target · ${MONTHS[target.getMonth()]} ${target.getDate()}, ${target.getFullYear()}`;
  const constraints = (answers || [])
    .filter((a) => a && !/^(yes|no|open|in 3|by next|end of|\$|something)/i.test(a))
    .join(' · ');
  return {
    title: deriveTitle(intention),
    outcome: tpl.outcome,
    target_date: targetDate,
    target_label: targetLabel,
    phases: tpl.phases.map((name, i) => ({ name, status: i === 0 ? 'in_progress' : 'not_started', note: tpl.notes[i] || '' })),
    constraints: constraints || '—',
    what_matters: 'Novi is lining up the first phase. Nothing runs until you approve it.',
    working_on: [{ label: 'Getting started', value: 'Just now' }],
    handling: [{ state: 'active', text: 'Setting up the first phase' }],
  };
}

// The steps shown on the "Novi is working" screen while a plan is built.
export function workingSteps(intention) {
  const tpl = phaseTemplate(intention);
  return [
    { text: 'Understood the outcome', sub: tpl.outcome, state: 'done' },
    { text: 'Checked what it usually takes', sub: 'Costs, timing, common pitfalls', state: 'done' },
    { text: `Mapped ${tpl.phases.length} phases`, sub: '', state: 'done' },
    { text: 'Working out the dependencies', sub: 'What has to happen before what', state: 'active' },
    { text: 'Setting milestone dates', sub: '', state: 'pending' },
    { text: 'Sizing the effort', sub: '', state: 'pending' },
  ];
}

// A mission-scoped chat reply. Deterministic, structured, never chain-of-thought.
export function chatReply(mission, question) {
  const q = (question || '').toLowerCase();
  const behind = mission.status === 'behind' || mission.status === 'at_risk';
  if (/still|on time|make it|june|date|when/.test(q)) {
    return {
      text: behind
        ? `You're a little behind, but the date still holds if the next phase lands on time. I'll flag the moment that changes.`
        : `Yes. You're on track for ${mission.target_label?.replace(/^Target[^A-Za-z0-9]*/, '') || 'your date'}. Nothing in the plan is at risk right now.`,
      what_moved: [
        { label: 'Target date', value: 'Unchanged', tone: 'success' },
        { label: 'Confidence', value: behind ? 'Holding' : 'On track', tone: behind ? 'warning' : 'success' },
      ],
    };
  }
  if (/behind|risk|worried|problem|late/.test(q)) {
    return {
      text: `The one thing to watch is ${mission.status_note || 'the current phase'}. If you close that this month, the rest of the plan is comfortable.`,
      what_moved: [{ label: 'Main risk', value: mission.status_note || 'Current phase', tone: 'warning' }],
    };
  }
  if (/next|do|focus|today|now/.test(q)) {
    return {
      text: `Focus on the actions in your Action Center — they're the ones that unblock the rest. I'm handling the monitoring and drafting in the background.`,
      what_moved: [{ label: 'Your part', value: 'Open actions', tone: 'accent' }],
    };
  }
  return {
    text: `I've noted that against ${mission.title}. When it changes the plan, I'll show you exactly what moved and why — you decide from there.`,
    what_moved: [],
  };
}
