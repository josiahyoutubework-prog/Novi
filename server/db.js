// Novi — SQLite data layer (node:sqlite, Node 22+).
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = process.env.NOVI_DB || path.join(__dirname, 'data.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function migrate() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'Novi Free',
    autonomy_level TEXT NOT NULL DEFAULT 'Co-pilot',
    allowed_categories TEXT NOT NULL DEFAULT '["monitor","organise","draft"]',
    must_ask_categories TEXT NOT NULL DEFAULT '["send","apply","purchase","book","share"]',
    theme TEXT NOT NULL DEFAULT 'system',
    calendar_connected INTEGER NOT NULL DEFAULT 0,
    notifications TEXT NOT NULL DEFAULT 'Important only',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    outcome TEXT NOT NULL DEFAULT '',
    target_date TEXT,
    target_label TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'on_track',
    progress INTEGER NOT NULL DEFAULT 0,
    status_note TEXT DEFAULT '',
    phases TEXT NOT NULL DEFAULT '[]',      -- JSON [{name,status,note}]
    constraints TEXT DEFAULT '',
    what_matters TEXT DEFAULT '',
    handling TEXT NOT NULL DEFAULT '[]',    -- JSON [{state,text}]
    working_on TEXT NOT NULL DEFAULT '[]',  -- JSON [{label,value}]
    dependency TEXT DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,                     -- approve | decide | review | confirm
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    options TEXT NOT NULL DEFAULT '[]',     -- JSON array of strings
    category TEXT DEFAULT 'send',           -- autonomy category
    draft TEXT DEFAULT '',                  -- JSON {to,body,disclosures[]} for approve
    status TEXT NOT NULL DEFAULT 'open',    -- open | resolved
    resolution TEXT DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS intelligence (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,                     -- risk | opportunity | dependency | change
    when_label TEXT DEFAULT '',
    headline TEXT NOT NULL,
    detail TEXT DEFAULT '',
    cta_label TEXT DEFAULT '',
    read INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',  -- active | suggested | available
    summary TEXT DEFAULT '',
    description TEXT DEFAULT '',
    does TEXT NOT NULL DEFAULT '[]',           -- JSON array
    needs TEXT NOT NULL DEFAULT '[]',          -- JSON array
    limitation TEXT DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS memory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'ABOUT YOU',
    text TEXT NOT NULL,
    learned_at TEXT DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    actor TEXT NOT NULL DEFAULT 'NOVI',        -- NOVI | YOU | RISK | TODAY | UPCOMING | DEADLINE | TARGET
    date_label TEXT DEFAULT '',
    text TEXT NOT NULL,
    future INTEGER NOT NULL DEFAULT 0,
    is_today INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                        -- user | novi
    text TEXT NOT NULL,
    what_moved TEXT DEFAULT '',                -- JSON [{label,value,tone}]
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS forgotten (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id TEXT REFERENCES missions(id) ON DELETE CASCADE,
    grouping TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    reason TEXT DEFAULT '',
    added INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  `);
}
