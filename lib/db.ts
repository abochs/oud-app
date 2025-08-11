// Delete a dose by id
export async function deleteDose(id: number) {
  const d = await db();
  await d.runAsync('DELETE FROM dose_event WHERE id = ?', [id]);
}

// Update a dose by id
export async function updateDose(id: number, amount_mg: number, ts: string) {
  const d = await db();
  await d.runAsync('UPDATE dose_event SET amount_mg = ?, ts = ? WHERE id = ?', [amount_mg, ts, id]);
}
// lib/db.ts (async, SDK 53+ API)
import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

async function db() {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('oud.db');
    // small perf boost and better reliability
    await _db.execAsync('PRAGMA journal_mode = WAL;');
  }
  return _db!;
}

export async function initDb() {
  const d = await db();

  await d.execAsync(`
    CREATE TABLE IF NOT EXISTS participant (
      study_id TEXT PRIMARY KEY,
      site_id TEXT,
      weight_band TEXT,
      egfr_cat TEXT,
      bup_half_life_h INTEGER DEFAULT 37,
      created_at TEXT
    );
  `);

  await d.execAsync(`
    CREATE TABLE IF NOT EXISTS dose_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      study_id TEXT,
      drug_code TEXT,
      amount_mg REAL,
      ts TEXT,
      note TEXT
    );
  `);

  await d.execAsync(`
    CREATE TABLE IF NOT EXISTS cows_checkin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      study_id TEXT,
      items TEXT,
      total INTEGER,
      severity TEXT,
      ts TEXT
    );
  `);
}

export async function ensureDefaultParticipant() {
  const studyId = 'demo-0001';
  const d = await db();
  await d.runAsync(
    `INSERT OR IGNORE INTO participant
     (study_id, site_id, weight_band, egfr_cat, bup_half_life_h, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [studyId, 'siteA', '70–79', '>=60', 37]
  );
  return studyId;
}

/* ---------- Dose helpers ---------- */
export async function insertDose(studyId: string, mg: number, note?: string) {
  const d = await db();
  const localIso = new Date().toISOString();
  await d.runAsync(
    `INSERT INTO dose_event (study_id, drug_code, amount_mg, ts, note)
     VALUES (?, 'BUP-SL', ?, ?, ?)`,
    [studyId, mg, localIso, note ?? null]
  );
}

export async function listRecentDoses(studyId: string, limit = 20) {
  const d = await db();
  // getAllAsync returns an array of rows
  const rows = await d.getAllAsync<{ id:number; amount_mg:number; ts:string }>(
    `SELECT id, amount_mg, ts
     FROM dose_event
     WHERE study_id=?
     ORDER BY ts DESC
     LIMIT ${limit}`,
    [studyId]
  );
  return rows;
}

export async function listAllDosesAsc(studyId: string) {
  const d = await db();
  const rows = await d.getAllAsync<{ amount_mg:number; ts:string }>(
    `SELECT amount_mg, ts
     FROM dose_event
     WHERE study_id=?
     ORDER BY ts ASC`,
    [studyId]
  );
  return rows;
}

/* ---------- COWS helpers ---------- */
export async function insertCows(
  studyId: string,
  items: Record<string, number>,
  total: number,
  severity: string
) {
  const d = await db();
  await d.runAsync(
    `INSERT INTO cows_checkin (study_id, items, total, severity, ts)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [studyId, JSON.stringify(items), total, severity]
  );
}

export async function getLatestCows(studyId: string) {
  const d = await db();
  const row = await d.getFirstAsync<{ total:number; severity:string }>(
    `SELECT total, severity
     FROM cows_checkin
     WHERE study_id=?
     ORDER BY ts DESC
     LIMIT 1`,
    [studyId]
  );
  return row ?? null;
}
