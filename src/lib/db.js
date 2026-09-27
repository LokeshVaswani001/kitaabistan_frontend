import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * SQLite storage layer (zero-dependency, Node's built-in `node:sqlite`).
 *
 * A single connection is cached on `globalThis` so Next.js dev-mode HMR and
 * the several route-handler bundles all share one handle instead of piling
 * up file descriptors.
 */

// On Vercel the project directory is read-only — only /tmp is writable, and
// it survives for the lifetime of the instance (data resets on redeploy).
const IS_SERVERLESS = !!process.env.VERCEL;
const DATA_DIR = IS_SERVERLESS ? "/tmp" : join(process.cwd(), "data");
const DB_PATH = process.env.KITAABISTAN_DB_PATH || join(DATA_DIR, "kitaabistan.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token            TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,
  kind             TEXT NOT NULL DEFAULT 'member',
  duration_minutes INTEGER,
  created_at       INTEGER NOT NULL,
  expires_at       INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS user_data (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, key)
);
`;

function columnExists(db, table, column) {
  return db.prepare(`PRAGMA table_info("${table}")`).all().some((row) => row.name === column);
}

/**
 * Forward-only migrations. `CREATE TABLE IF NOT EXISTS` never alters an
 * existing table, so anything added to a table after it was first created
 * has to be grafted on here.
 *
 * When `sessions` predates the demo-session columns it is rebuilt through a
 * staging table, which also relaxes `user_id` to nullable — demo sessions
 * belong to no account. Existing member sessions are carried across.
 */
function migrate(db) {
  if (!columnExists(db, "sessions", "kind")) {
    db.exec(`
      BEGIN;
      CREATE TABLE sessions_new (
        token            TEXT PRIMARY KEY,
        user_id          TEXT REFERENCES users(id) ON DELETE CASCADE,
        kind             TEXT NOT NULL DEFAULT 'member',
        duration_minutes INTEGER,
        created_at       INTEGER NOT NULL,
        expires_at       INTEGER NOT NULL
      );
      INSERT INTO sessions_new (token, user_id, created_at, expires_at)
        SELECT token, user_id, created_at, expires_at FROM sessions;
      DROP TABLE sessions;
      ALTER TABLE sessions_new RENAME TO sessions;
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
      COMMIT;
    `);
  }
}

function open() {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

const store = globalThis.__kitaabistanDb ?? (globalThis.__kitaabistanDb = open());

/** Run one statement. */
export function execute(sql, ...params) {
  return store.prepare(sql).run(...params);
}

/** First matching row, or undefined. */
export function get(sql, ...params) {
  return store.prepare(sql).get(...params);
}

/** All matching rows. */
export function all(sql, ...params) {
  return store.prepare(sql).all(...params);
}

/** Last-write-wins upsert that still refuses to rewind an older timestamp. */
export function upsertUserData(userId, key, value, updatedAt) {
  store
    .prepare(
      `INSERT INTO user_data (user_id, key, value, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET
         value = excluded.value,
         updated_at = MAX(user_data.updated_at, excluded.updated_at)
       WHERE excluded.updated_at >= user_data.updated_at`
    )
    .run(userId, key, value, updatedAt);
}

/** Drop sessions that are past their expiry — cheap housekeeping. */
export function pruneExpiredSessions() {
  execute("DELETE FROM sessions WHERE expires_at < ?", Date.now());
}
