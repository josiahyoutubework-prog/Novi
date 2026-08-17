// Novi — API server (Express + node:sqlite). In production it also serves the
// built React frontend, so the whole app deploys as one service.
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { seed } from './seed.js';
import { buildPlan, clarifyingQuestions, workingSteps, chatReply, deriveTitle } from './novi.js';
import { hashPassword, verifyPassword } from './hash.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env (if present) so ANTHROPIC_API_KEY / NOVI_MODEL are available.
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env — fine */ }
const { aiEnabled, aiBuildPlan, aiChatReply } = await import('./ai.js');

seed(); // migrate + seed on first boot

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

// Conservative security headers (no dependency needed).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

const PORT = process.env.PORT || 4000;
const all = (sql, ...p) => db.prepare(sql).all(...p);
const one = (sql, ...p) => db.prepare(sql).get(...p);
const run = (sql, ...p) => db.prepare(sql).run(...p);
const now = () => new Date().toISOString();
const J = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };

// ---- Auth ---------------------------------------------------------------
function issueToken(userId) {
  const token = randomUUID();
  run('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)', token, userId, now());
  return token;
}
function userFromReq(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!t) return null;
  const s = one('SELECT * FROM sessions WHERE token = ?', t);
  return s ? one('SELECT * FROM users WHERE id = ?', s.user_id) : null;
}
function auth(req, res, next) {
  const u = userFromReq(req);
  if (!u) return res.status(401).json({ error: 'Not authenticated' });
  req.user = u;
  next();
}
const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, plan: u.plan, initials: initials(u.name),
  autonomyLevel: u.autonomy_level,
  allowedCategories: J(u.allowed_categories, []),
  mustAskCategories: J(u.must_ask_categories, []),
  theme: u.theme, calendarConnected: !!u.calendar_connected, notifications: u.notifications,
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const u = one('SELECT * FROM users WHERE lower(email)=lower(?)', String(email || '').trim());
  if (!u || !verifyPassword(String(password || ''), u.password)) return res.status(401).json({ error: 'That email and password don’t match.' });
  res.json({ token: issueToken(u.id), user: publicUser(u) });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  const nm = String(name || '').trim() || 'You';
  const em = String(email || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(em)) return res.status(400).json({ error: 'Enter a valid email to continue.' });
  if (one('SELECT id FROM users WHERE lower(email)=lower(?)', em)) return res.status(409).json({ error: 'An account already uses that email.' });
  const id = 'user_' + randomUUID().slice(0, 8);
  run(
    `INSERT INTO users (id,name,email,password,plan,autonomy_level,theme,calendar_connected,notifications,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    id, nm.slice(0, 80), em, hashPassword(String(password || 'welcome')), 'Novi Free', 'Co-pilot', 'system', 0, 'Important only', now()
  );
  const u = one('SELECT * FROM users WHERE id=?', id);
  res.json({ token: issueToken(id), user: publicUser(u) });
});

app.post('/api/auth/recover', (req, res) => {
  // Simulated magic link — always succeeds so the flow completes.
  res.json({ ok: true, message: 'If that email is registered, a sign-in link is on its way.' });
});

app.post('/api/auth/logout', auth, (req, res) => {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  run('DELETE FROM sessions WHERE token=?', t);
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user) }));

// ---- Serialisers --------------------------------------------------------
const missionOut = (m) => ({
  id: m.id, title: m.title, outcome: m.outcome, targetDate: m.target_date, targetLabel: m.target_label,
  status: m.status, progress: m.progress, statusNote: m.status_note,
  phases: J(m.phases, []), constraints: m.constraints, whatMatters: m.what_matters,
  handling: J(m.handling, []), workingOn: J(m.working_on, []), dependency: m.dependency, sort: m.sort,
});
const actionOut = (a) => ({
  id: a.id, missionId: a.mission_id, kind: a.kind, title: a.title, subtitle: a.subtitle,
  options: J(a.options, []), category: a.category, draft: a.draft ? J(a.draft, null) : null,
  status: a.status, resolution: a.resolution,
});
const intelOut = (i) => ({ id: i.id, missionId: i.mission_id, kind: i.kind, whenLabel: i.when_label, headline: i.headline, detail: i.detail, ctaLabel: i.cta_label, read: !!i.read });
const agentOut = (a) => ({ id: a.id, missionId: a.mission_id, name: a.name, status: a.status, summary: a.summary, description: a.description, does: J(a.does, []), needs: J(a.needs, []), limitation: a.limitation });
const memoryOut = (m) => ({ id: m.id, category: m.category, text: m.text, learnedAt: m.learned_at });
const activityOut = (a) => ({ id: a.id, missionId: a.mission_id, actor: a.actor, dateLabel: a.date_label, text: a.text, future: !!a.future, isToday: !!a.is_today });
const forgottenOut = (f) => ({ id: f.id, missionId: f.mission_id, grouping: f.grouping, title: f.title, reason: f.reason, added: !!f.added });

// ---- Missions -----------------------------------------------------------
app.get('/api/missions', auth, (req, res) => {
  const rows = all('SELECT * FROM missions WHERE user_id=? ORDER BY sort, created_at', req.user.id);
  res.json({ missions: rows.map(missionOut) });
});

app.get('/api/missions/:id', auth, (req, res) => {
  const m = one('SELECT * FROM missions WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!m) return res.status(404).json({ error: 'Mission not found' });
  res.json({
    mission: missionOut(m),
    actions: all('SELECT * FROM actions WHERE mission_id=? AND user_id=? ORDER BY sort', m.id, req.user.id).map(actionOut),
    intelligence: all('SELECT * FROM intelligence WHERE mission_id=? AND user_id=? ORDER BY sort', m.id, req.user.id).map(intelOut),
    agents: all('SELECT * FROM agents WHERE mission_id=? AND user_id=? ORDER BY sort', m.id, req.user.id).map(agentOut),
    activity: all('SELECT * FROM activity WHERE mission_id=? AND user_id=? ORDER BY sort', m.id, req.user.id).map(activityOut),
    forgotten: all('SELECT * FROM forgotten WHERE mission_id=? AND user_id=? ORDER BY sort', m.id, req.user.id).map(forgottenOut),
  });
});

// Mission creation flow: preview the questions, then build the plan, then commit.
app.post('/api/missions/clarify', auth, (req, res) => {
  const { intention } = req.body || {};
  res.json({ title: deriveTitle(intention || ''), questions: clarifyingQuestions(intention || ''), steps: workingSteps(intention || '') });
});

app.post('/api/missions/plan', auth, async (req, res) => {
  const { intention, answers } = req.body || {};
  let plan;
  try {
    plan = await aiBuildPlan(intention || '', answers || []);
  } catch (e) {
    if (aiEnabled()) console.warn('[ai] plan fell back to the deterministic engine:', e.message);
    plan = buildPlan(intention || '', answers || []);
  }
  res.json({ plan });
});

app.post('/api/missions', auth, (req, res) => {
  const { plan } = req.body || {};
  if (!plan || !plan.title) return res.status(400).json({ error: 'A plan is required to start a mission.' });
  const id = 'mission_' + randomUUID().slice(0, 8);
  const maxSort = one('SELECT MAX(sort) s FROM missions WHERE user_id=?', req.user.id)?.s ?? -1;
  run(
    `INSERT INTO missions (id,user_id,title,outcome,target_date,target_label,status,progress,status_note,phases,constraints,what_matters,handling,working_on,dependency,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    id, req.user.id, plan.title, plan.outcome || '', plan.target_date || null, plan.target_label || '',
    'on_track', 3, 'Just started',
    JSON.stringify(plan.phases || []), plan.constraints || '', plan.what_matters || '',
    JSON.stringify(plan.handling || []), JSON.stringify(plan.working_on || []), '', maxSort + 1, now()
  );
  run(`INSERT INTO activity (id,user_id,mission_id,actor,date_label,text,is_today,sort,created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    randomUUID(), req.user.id, id, 'YOU', 'TODAY', `Started the mission "${plan.title}"`, 1, 0, now());
  res.json({ mission: missionOut(one('SELECT * FROM missions WHERE id=?', id)) });
});

app.patch('/api/missions/:id', auth, (req, res) => {
  const m = one('SELECT * FROM missions WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!m) return res.status(404).json({ error: 'Mission not found' });
  const { progress, status } = req.body || {};
  if (progress != null) run('UPDATE missions SET progress=? WHERE id=?', Math.max(0, Math.min(100, progress)), m.id);
  if (status) run('UPDATE missions SET status=? WHERE id=?', status, m.id);
  res.json({ mission: missionOut(one('SELECT * FROM missions WHERE id=?', m.id)) });
});

// Mark a mission complete: every phase done, progress 100, logged, and a
// computed results summary returned for the completion screen.
app.post('/api/missions/:id/complete', auth, (req, res) => {
  const m = one('SELECT * FROM missions WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!m) return res.status(404).json({ error: 'Mission not found' });
  const phases = J(m.phases, []).map((p) => ({ ...p, status: 'complete' }));
  run('UPDATE missions SET status=?, progress=?, phases=?, status_note=?, what_matters=? WHERE id=?',
    'complete', 100, JSON.stringify(phases), 'Complete', 'This mission is done. Novi kept a record of everything it handled.', m.id);
  run(`INSERT INTO activity (id,user_id,mission_id,actor,date_label,text,is_today,sort,created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    randomUUID(), req.user.id, m.id, 'NOVI', 'TODAY', `Marked "${m.title}" complete`, 1, -2, now());
  // Compute a results summary from what's on the mission.
  const handled = one('SELECT COUNT(*) c FROM activity WHERE mission_id=? AND user_id=? AND actor IN (?,?)', m.id, req.user.id, 'NOVI', 'YOU')?.c ?? 0;
  const resolved = one('SELECT COUNT(*) c FROM actions WHERE mission_id=? AND user_id=? AND status=?', m.id, req.user.id, 'resolved')?.c ?? 0;
  res.json({
    mission: missionOut(one('SELECT * FROM missions WHERE id=?', m.id)),
    summary: {
      finishedLabel: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      phases: phases.length,
      actionsHandled: resolved,
      noviActions: handled,
    },
  });
});

// ---- Actions ------------------------------------------------------------
app.get('/api/actions', auth, (req, res) => {
  const rows = all('SELECT * FROM actions WHERE user_id=? AND status=? ORDER BY sort', req.user.id, 'open');
  res.json({ actions: rows.map(actionOut) });
});

app.post('/api/actions/:id/resolve', auth, (req, res) => {
  const a = one('SELECT * FROM actions WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!a) return res.status(404).json({ error: 'Action not found' });
  const { choice } = req.body || {};
  run('UPDATE actions SET status=?, resolution=? WHERE id=?', 'resolved', String(choice || 'Done'), a.id);
  const verb = a.kind === 'approve' ? 'Sent' : a.kind === 'decide' ? 'Decided' : a.kind === 'confirm' ? 'Confirmed' : 'Reviewed';
  run(`INSERT INTO activity (id,user_id,mission_id,actor,date_label,text,is_today,sort,created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    randomUUID(), req.user.id, a.mission_id, 'YOU', 'TODAY', `${verb}: ${a.title.replace(/\?$/, '')}${choice ? ` — ${choice}` : ''}`, 1, -1, now());
  // Nudge the mission along a touch.
  if (a.mission_id) {
    const m = one('SELECT * FROM missions WHERE id=?', a.mission_id);
    if (m && m.progress < 100) run('UPDATE missions SET progress=? WHERE id=?', Math.min(100, m.progress + 3), m.id);
    const remaining = one('SELECT COUNT(*) c FROM actions WHERE mission_id=? AND status=?', a.mission_id, 'open')?.c ?? 0;
    if (m) run('UPDATE missions SET status_note=? WHERE id=?', remaining ? `${remaining} action${remaining === 1 ? '' : 's'} need you` : 'All caught up', m.id);
  }
  res.json({ action: actionOut(one('SELECT * FROM actions WHERE id=?', a.id)) });
});

// ---- Intelligence -------------------------------------------------------
app.get('/api/intelligence', auth, (req, res) => {
  res.json({ intelligence: all('SELECT * FROM intelligence WHERE user_id=? ORDER BY sort', req.user.id).map(intelOut) });
});

// ---- Agents -------------------------------------------------------------
app.get('/api/agents', auth, (req, res) => {
  res.json({ agents: all('SELECT * FROM agents WHERE user_id=? ORDER BY sort', req.user.id).map(agentOut) });
});
app.get('/api/agents/:id', auth, (req, res) => {
  const a = one('SELECT * FROM agents WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!a) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent: agentOut(a) });
});
app.post('/api/agents/:id/activate', auth, (req, res) => {
  const a = one('SELECT * FROM agents WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!a) return res.status(404).json({ error: 'Agent not found' });
  const missionId = req.body?.missionId || a.mission_id || one('SELECT id FROM missions WHERE user_id=? ORDER BY sort LIMIT 1', req.user.id)?.id;
  run('UPDATE agents SET status=?, mission_id=?, summary=? WHERE id=?', 'active', missionId, a.summary || 'Now working on this mission', a.id);
  run(`INSERT INTO activity (id,user_id,mission_id,actor,date_label,text,is_today,sort,created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    randomUUID(), req.user.id, missionId, 'NOVI', 'TODAY', `Activated the ${a.name}`, 1, -1, now());
  res.json({ agent: agentOut(one('SELECT * FROM agents WHERE id=?', a.id)) });
});

// ---- Memory -------------------------------------------------------------
app.get('/api/memory', auth, (req, res) => {
  res.json({ memory: all('SELECT * FROM memory WHERE user_id=? ORDER BY sort, created_at', req.user.id).map(memoryOut) });
});
app.post('/api/memory', auth, (req, res) => {
  const { category, text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Nothing to remember' });
  const id = randomUUID();
  const maxSort = one('SELECT MAX(sort) s FROM memory WHERE user_id=?', req.user.id)?.s ?? -1;
  run('INSERT INTO memory (id,user_id,category,text,sort,created_at) VALUES (?,?,?,?,?,?)', id, req.user.id, category || 'ABOUT YOU', text, maxSort + 1, now());
  res.json({ item: memoryOut(one('SELECT * FROM memory WHERE id=?', id)) });
});
app.patch('/api/memory/:id', auth, (req, res) => {
  const m = one('SELECT * FROM memory WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  run('UPDATE memory SET text=? WHERE id=?', String(req.body?.text ?? m.text), m.id);
  res.json({ item: memoryOut(one('SELECT * FROM memory WHERE id=?', m.id)) });
});
app.delete('/api/memory/:id', auth, (req, res) => {
  run('DELETE FROM memory WHERE id=? AND user_id=?', req.params.id, req.user.id);
  res.json({ ok: true });
});
app.delete('/api/memory', auth, (req, res) => {
  run('DELETE FROM memory WHERE user_id=?', req.user.id);
  res.json({ ok: true });
});

// ---- Forgotten ("What am I forgetting?") -------------------------------
app.post('/api/forgotten/:id/add', auth, (req, res) => {
  const f = one('SELECT * FROM forgotten WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!f) return res.status(404).json({ error: 'Not found' });
  run('UPDATE forgotten SET added=1 WHERE id=?', f.id);
  res.json({ item: forgottenOut(one('SELECT * FROM forgotten WHERE id=?', f.id)) });
});
app.post('/api/missions/:id/forgotten/add-all', auth, (req, res) => {
  run('UPDATE forgotten SET added=1 WHERE mission_id=? AND user_id=? AND grouping != ?', req.params.id, req.user.id, 'LESS URGENT');
  res.json({ forgotten: all('SELECT * FROM forgotten WHERE mission_id=? AND user_id=? ORDER BY sort', req.params.id, req.user.id).map(forgottenOut) });
});

// ---- Chat ---------------------------------------------------------------
app.get('/api/missions/:id/chat', auth, (req, res) => {
  const rows = all('SELECT * FROM chat_messages WHERE mission_id=? AND user_id=? ORDER BY created_at', req.params.id, req.user.id);
  res.json({ messages: rows.map((m) => ({ id: m.id, role: m.role, text: m.text, whatMoved: m.what_moved ? J(m.what_moved, []) : [], createdAt: m.created_at })) });
});
app.post('/api/missions/:id/chat', auth, async (req, res) => {
  const m = one('SELECT * FROM missions WHERE id=? AND user_id=?', req.params.id, req.user.id);
  if (!m) return res.status(404).json({ error: 'Mission not found' });
  const text = String(req.body?.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Empty message' });
  run('INSERT INTO chat_messages (id,user_id,mission_id,role,text,created_at) VALUES (?,?,?,?,?,?)', randomUUID(), req.user.id, m.id, 'user', text, now());
  let reply;
  try {
    reply = await aiChatReply(m, text);
  } catch (e) {
    if (aiEnabled()) console.warn('[ai] chat fell back to the deterministic engine:', e.message);
    reply = chatReply(m, text);
  }
  const rid = randomUUID();
  run('INSERT INTO chat_messages (id,user_id,mission_id,role,text,what_moved,created_at) VALUES (?,?,?,?,?,?,?)', rid, req.user.id, m.id, 'novi', reply.text, JSON.stringify(reply.what_moved || []), now());
  res.json({ reply: { id: rid, role: 'novi', text: reply.text, whatMoved: reply.what_moved || [], why: reply.why || [] } });
});

// ---- Settings / Autonomy -----------------------------------------------
app.patch('/api/settings', auth, (req, res) => {
  const { autonomyLevel, theme, notifications, calendarConnected, allowedCategories, mustAskCategories } = req.body || {};
  if (autonomyLevel) run('UPDATE users SET autonomy_level=? WHERE id=?', autonomyLevel, req.user.id);
  if (theme) run('UPDATE users SET theme=? WHERE id=?', theme, req.user.id);
  if (notifications) run('UPDATE users SET notifications=? WHERE id=?', notifications, req.user.id);
  if (calendarConnected != null) run('UPDATE users SET calendar_connected=? WHERE id=?', calendarConnected ? 1 : 0, req.user.id);
  if (allowedCategories) run('UPDATE users SET allowed_categories=? WHERE id=?', JSON.stringify(allowedCategories), req.user.id);
  if (mustAskCategories) run('UPDATE users SET must_ask_categories=? WHERE id=?', JSON.stringify(mustAskCategories), req.user.id);
  res.json({ user: publicUser(one('SELECT * FROM users WHERE id=?', req.user.id)) });
});

app.get('/api/health', (req, res) => res.json({ ok: true, ai: aiEnabled() }));

// Unknown API routes return JSON 404 (not the SPA fallback below).
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---- Serve the built frontend (production) ------------------------------
// When web/dist exists, serve it and fall back to index.html for client-side
// routes, so the whole product is one deployable service on a single origin.
const webDist = path.join(__dirname, '..', 'web', 'dist');
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
  console.log('[api] serving built frontend from web/dist');
}

// Global error handler — always return JSON, never an HTML stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[api] error:', err.message);
  if (res.headersSent) return;
  const status = err.type === 'entity.too.large' ? 413 : err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});

// Don't let a stray rejection take the process down.
process.on('unhandledRejection', (reason) => console.error('[api] unhandledRejection:', reason));

export const server = app.listen(PORT, () => console.log(`[api] Novi listening on http://localhost:${PORT}`));
export { app };
