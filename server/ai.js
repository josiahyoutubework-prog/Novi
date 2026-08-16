// Novi's real "intelligence": Anthropic-backed mission planning and chat.
// If no ANTHROPIC_API_KEY is configured (or a call fails), the caller falls back
// to the deterministic engine in novi.js, so the app is always functional.
import Anthropic from '@anthropic-ai/sdk';
import { targetFor } from './novi.js';

// Default to the most capable model; override with NOVI_MODEL if desired.
const MODEL = process.env.NOVI_MODEL || 'claude-opus-5';

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  return client;
}
export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

// Novi's voice, shared across prompts.
const VOICE =
  'You are Novi, an AI chief of staff that turns a person\'s intention into a managed outcome. ' +
  'Voice: plain, factual, second person, like a competent colleague. State consequences, not events. ' +
  'No exclamation marks, no emoji, no hype, no gamification.';

// Pull the first text block out of a Messages response and JSON-parse it.
function parseJson(response) {
  const block = response.content.find((b) => b.type === 'text');
  if (!block) throw new Error('No text block in response');
  return JSON.parse(block.text);
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    outcome: { type: 'string' },
    constraints: { type: 'string' },
    what_matters: { type: 'string' },
    phases: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, note: { type: 'string' } },
        required: ['name', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'outcome', 'constraints', 'what_matters', 'phases'],
  additionalProperties: false,
};

// Build a Mission plan from the intention + up to three clarifying answers.
export async function aiBuildPlan(intention, answers) {
  const c = getClient();
  if (!c) throw new Error('AI disabled');

  const answerLines = (answers || []).filter(Boolean).map((a) => `- ${a}`).join('\n') || '- (none given)';
  const response = await c.messages.create({
    model: MODEL,
    max_tokens: 6000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: PLAN_SCHEMA } },
    system:
      `${VOICE} Turn the person's intention into a Mission plan: a short title (their goal, title-cased), ` +
      'a one-sentence outcome describing what "done" looks like, EXACTLY five phases (each a short imperative ' +
      'name plus a rationale note under 14 words), a one-line constraints summary drawn from their answers, ' +
      'and a one-sentence "what_matters" naming the first real thing to do. Return only the structured fields.',
    messages: [
      {
        role: 'user',
        content: `Intention: ${intention}\n\nWhat they told me:\n${answerLines}`,
      },
    ],
  });

  const raw = parseJson(response);
  const phases = (raw.phases || []).slice(0, 5).map((p, i) => ({
    name: p.name,
    status: i === 0 ? 'in_progress' : 'not_started',
    note: p.note || '',
  }));
  const { target_date, target_label } = targetFor(answers);
  return {
    title: raw.title,
    outcome: raw.outcome,
    target_date,
    target_label,
    phases,
    constraints: raw.constraints || '—',
    what_matters: raw.what_matters || 'Novi is lining up the first phase. Nothing runs until you approve it.',
    working_on: [{ label: 'Getting started', value: 'Just now' }],
    handling: [{ state: 'active', text: 'Setting up the first phase' }],
  };
}

const CHAT_SCHEMA = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    whatMoved: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          tone: { type: 'string', enum: ['success', 'warning', 'accent', 'neutral'] },
        },
        required: ['label', 'value', 'tone'],
        additionalProperties: false,
      },
    },
  },
  required: ['text', 'whatMoved'],
  additionalProperties: false,
};

// Answer a mission-scoped question. Returns { text, what_moved }.
export async function aiChatReply(mission, question) {
  const c = getClient();
  if (!c) throw new Error('AI disabled');

  const phases = (mission.phases ? JSON.parse(mission.phases) : [])
    .map((p) => `${p.name} (${p.status})`)
    .join(', ');
  const context =
    `Mission: ${mission.title}\n` +
    `Status: ${mission.status}${mission.status_note ? ` — ${mission.status_note}` : ''}\n` +
    `${mission.target_label || ''}\n` +
    (phases ? `Phases: ${phases}\n` : '') +
    (mission.outcome ? `Outcome: ${mission.outcome}\n` : '');

  const response = await c.messages.create({
    model: MODEL,
    max_tokens: 3000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: CHAT_SCHEMA } },
    system:
      `${VOICE} You are answering a question scoped to one of the user's missions. ` +
      'Give only a clear conclusion in 1–3 sentences — never reveal step-by-step reasoning. ' +
      'If your answer implies a change to the plan, include 1–3 "whatMoved" rows summarising the deltas ' +
      '(label, short value, and a tone: success, warning, accent, or neutral). Otherwise return an empty whatMoved.',
    messages: [
      { role: 'user', content: `${context}\nQuestion: ${question}` },
    ],
  });

  const raw = parseJson(response);
  return { text: raw.text, what_moved: raw.whatMoved || [] };
}
