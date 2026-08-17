// Novi API tests — run with `npm test` (node --test) against an isolated temp DB.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Isolate the DB and port BEFORE importing the server (it seeds + listens on import).
const DB = path.join(os.tmpdir(), `novi_test_${Date.now()}.db`);
process.env.NOVI_DB = DB;
process.env.PORT = process.env.TEST_PORT || '4399';
process.env.ANTHROPIC_API_KEY = ''; // force the deterministic engine

const { server } = await import('../index.js');
const BASE = `http://localhost:${process.env.PORT}`;

after(() => {
  server.close();
  for (const f of [DB, `${DB}-wal`, `${DB}-shm`]) { try { fs.rmSync(f); } catch { /* ignore */ } }
});

async function api(method, p, { token, body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + p, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const txt = await res.text();
  return { status: res.status, body: txt ? JSON.parse(txt) : {} };
}

async function login() {
  const r = await api('POST', '/api/auth/login', { body: { email: 'alex@mercer.co', password: 'password123' } });
  return r.body.token;
}

test('health responds', async () => {
  const r = await api('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(typeof r.body.ai, 'boolean');
});

test('login rejects a wrong password', async () => {
  const r = await api('POST', '/api/auth/login', { body: { email: 'alex@mercer.co', password: 'nope' } });
  assert.equal(r.status, 401);
});

test('login succeeds with the seeded (hashed) demo password', async () => {
  const r = await api('POST', '/api/auth/login', { body: { email: 'alex@mercer.co', password: 'password123' } });
  assert.equal(r.status, 200);
  assert.ok(r.body.token);
  assert.equal(r.body.user.email, 'alex@mercer.co');
});

test('protected routes require auth', async () => {
  const r = await api('GET', '/api/missions');
  assert.equal(r.status, 401);
});

test('/me returns the current user', async () => {
  const r = await api('GET', '/api/me', { token: await login() });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.plan, 'Novi Pro');
});

test('signup validates the email', async () => {
  const r = await api('POST', '/api/auth/signup', { body: { name: 'X', email: 'not-an-email', password: 'welcome' } });
  assert.equal(r.status, 400);
});

test('signup rejects a duplicate email', async () => {
  const r = await api('POST', '/api/auth/signup', { body: { name: 'X', email: 'alex@mercer.co', password: 'welcome' } });
  assert.equal(r.status, 409);
});

test('signup creates a fresh account', async () => {
  const r = await api('POST', '/api/auth/signup', { body: { name: 'New Person', email: `new_${Date.now()}@test.co`, password: 'welcome' } });
  assert.equal(r.status, 200);
  assert.ok(r.body.token);
  assert.equal(r.body.user.plan, 'Novi Free');
});

test('missions list has the four seeded missions', async () => {
  const r = await api('GET', '/api/missions', { token: await login() });
  assert.equal(r.status, 200);
  assert.equal(r.body.missions.length, 4);
});

test('mission detail returns nested data', async () => {
  const r = await api('GET', '/api/missions/mission_vancouver', { token: await login() });
  assert.equal(r.status, 200);
  assert.equal(r.body.actions.length, 4);
  assert.ok(r.body.intelligence.length > 0);
  assert.ok(r.body.agents.length > 0);
  assert.ok(r.body.forgotten.length > 0);
});

test('an unknown mission is 404', async () => {
  const r = await api('GET', '/api/missions/does-not-exist', { token: await login() });
  assert.equal(r.status, 404);
});

test('resolving an action removes it from the open list', async () => {
  const token = await login();
  const before = await api('GET', '/api/actions', { token });
  const action = before.body.actions[0];
  const r = await api('POST', `/api/actions/${action.id}/resolve`, { token, body: { choice: 'Sent' } });
  assert.equal(r.status, 200);
  const after = await api('GET', '/api/actions', { token });
  assert.equal(after.body.actions.length, before.body.actions.length - 1);
});

test('plan generation + mission creation carries the plan title', async () => {
  const token = await login();
  const p = await api('POST', '/api/missions/plan', { token, body: { intention: 'learn spanish', answers: ['End of the year'] } });
  assert.equal(p.status, 200);
  assert.ok(p.body.plan.phases.length >= 1);
  const c = await api('POST', '/api/missions', { token, body: { plan: p.body.plan } });
  assert.equal(c.status, 200);
  assert.equal(c.body.mission.title, p.body.plan.title);
  assert.equal(c.body.mission.status, 'on_track');
});

test('marking a mission complete returns a summary', async () => {
  const r = await api('POST', '/api/missions/mission_thesis/complete', { token: await login() });
  assert.equal(r.status, 200);
  assert.equal(r.body.mission.status, 'complete');
  assert.equal(r.body.mission.progress, 100);
  assert.ok(r.body.summary.finishedLabel);
});

test('memory add / edit / delete', async () => {
  const token = await login();
  const add = await api('POST', '/api/memory', { token, body: { category: 'ABOUT YOU', text: 'Likes tests' } });
  assert.equal(add.status, 200);
  const id = add.body.item.id;
  const edit = await api('PATCH', `/api/memory/${id}`, { token, body: { text: 'Loves tests' } });
  assert.equal(edit.body.item.text, 'Loves tests');
  const del = await api('DELETE', `/api/memory/${id}`, { token });
  assert.equal(del.status, 200);
});

test('chat returns text, whatMoved and why', async () => {
  const r = await api('POST', '/api/missions/mission_vancouver/chat', { token: await login(), body: { text: 'can I still make it on time?' } });
  assert.equal(r.status, 200);
  assert.ok(r.body.reply.text.length > 0);
  assert.ok(Array.isArray(r.body.reply.whatMoved));
  assert.ok(Array.isArray(r.body.reply.why) && r.body.reply.why.length > 0);
});

test('autonomy level update persists', async () => {
  const r = await api('PATCH', '/api/settings', { token: await login(), body: { autonomyLevel: 'Autopilot' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.autonomyLevel, 'Autopilot');
});

test('fitness settings load with a default alarm and a seeded streak', async () => {
  const r = await api('GET', '/api/fitness', { token: await login() });
  assert.equal(r.status, 200);
  assert.equal(r.body.settings.pushupGoal, 20);
  assert.equal(r.body.settings.alarmTime, '07:00');
  assert.ok(r.body.streak >= 2); // two seeded prior days
});

test('fitness goal update clamps and persists', async () => {
  const token = await login();
  const r = await api('PATCH', '/api/fitness', { token, body: { pushupGoal: 35, enabled: true, alarmTime: '06:30' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.settings.pushupGoal, 35);
  assert.equal(r.body.settings.enabled, true);
  assert.equal(r.body.settings.alarmTime, '06:30');
  const clamp = await api('PATCH', '/api/fitness', { token, body: { pushupGoal: 9999 } });
  assert.equal(clamp.body.settings.pushupGoal, 500);
});

test('completing a challenge logs it and marks today done', async () => {
  const r = await api('POST', '/api/fitness/complete', { token: await login(), body: { reps: 20, kind: 'now' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.completedToday, true);
  assert.ok(r.body.log[0].reps === 20);
});

test('unknown API routes return JSON 404', async () => {
  const r = await api('GET', '/api/nope', { token: await login() });
  assert.equal(r.status, 404);
  assert.equal(r.body.error, 'Not found');
});
