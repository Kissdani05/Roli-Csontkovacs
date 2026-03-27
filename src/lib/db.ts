import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Az adatbázis fájl a projekt gyökerében lévő /data mappában lesz
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "bookings.db");

// Mappa létrehozása ha nem létezik
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// WAL mód jobb teljesítményért
db.pragma("journal_mode = WAL");

// Meglévő DB-re: appeared oszlop hozzáadása ha hiányzik
try { db.exec("ALTER TABLE bookings ADD COLUMN appeared INTEGER"); } catch { /* már létezik */ }

// Tábla létrehozása ha még nem létezik
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    email       TEXT,
    note        TEXT,
    date        TEXT    NOT NULL,
    time        TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending',
    appeared    INTEGER,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT NOT NULL,
    time       TEXT NOT NULL,
    reason     TEXT NOT NULL DEFAULT 'Blokkolt',
    UNIQUE(date, time)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    phone            TEXT UNIQUE NOT NULL,
    name             TEXT NOT NULL,
    email            TEXT,
    birth_date       TEXT,
    notes            TEXT,
    blacklisted      INTEGER NOT NULL DEFAULT 0,
    blacklist_reason TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  date: string;
  time: string;
  status: BookingStatus;
  appeared: number | null; // 1 = igen, 0 = nem, null = ismeretlen
  created_at: string;
}

export interface NewBooking {
  name: string;
  phone: string;
  email?: string;
  note?: string;
  date: string;
  time: string;
}

// Új foglalás mentése
export function insertBooking(data: NewBooking): Booking {
  const stmt = db.prepare(`
    INSERT INTO bookings (name, phone, email, note, date, time)
    VALUES (@name, @phone, @email, @note, @date, @time)
  `);
  const result = stmt.run({
    name: data.name,
    phone: data.phone,
    email: data.email ?? null,
    note: data.note ?? null,
    date: data.date,
    time: data.time,
  });
  return getBookingById(result.lastInsertRowid as number)!;
}

// Egy foglalás lekérése ID alapján
export function getBookingById(id: number): Booking | undefined {
  return db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(id) as Booking | undefined;
}

// Összes foglalás lekérése (dátum/idő szerint)
export function getAllBookings(): Booking[] {
  return db
    .prepare("SELECT * FROM bookings ORDER BY date ASC, time ASC")
    .all() as Booking[];
}

// Egy adott időrés foglalt-e (pending vagy confirmed státuszú foglalás van-e rá)
export function isSlotTaken(date: string, time: string): boolean {
  const row = db
    .prepare(
      "SELECT 1 FROM bookings WHERE date = ? AND time = ? AND status IN ('pending', 'confirmed') LIMIT 1"
    )
    .get(date, time);
  return row !== undefined;
}

// Egy adott napra lefoglalt időpontok listája
export function getOccupiedSlots(date: string): string[] {
  const rows = db
    .prepare(
      "SELECT time FROM bookings WHERE date = ? AND status IN ('pending', 'confirmed')"
    )
    .all(date) as { time: string }[];
  return rows.map((r) => r.time);
}

// Foglalás adatainak módosítása
export function updateBooking(id: number, data: NewBooking): void {
  db.prepare(`
    UPDATE bookings SET name = @name, phone = @phone, email = @email, note = @note, date = @date, time = @time
    WHERE id = @id
  `).run({ id, name: data.name, phone: data.phone, email: data.email ?? null, note: data.note ?? null, date: data.date, time: data.time });
}

// Foglalás státuszának frissítése
export function updateBookingStatus(id: number, status: BookingStatus): void {
  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);
}

// Megjelenés rögzítése (1 = megjelent, 0 = nem jelent meg)
export function updateAppearance(id: number, appeared: boolean): void {
  db.prepare("UPDATE bookings SET appeared = ? WHERE id = ?").run(appeared ? 1 : 0, id);
}

// Foglalás törlése
export function deleteBooking(id: number): void {
  db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
}

// ── Blocks ─────────────────────────────────────────────────────────────────
export interface Block {
  id: number;
  date: string;
  time: string;
  reason: string;
}

export function insertBlock(date: string, time: string, reason: string): Block {
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO blocks (date, time, reason) VALUES (?, ?, ?)"
  );
  const result = stmt.run(date, time, reason);
  return db.prepare("SELECT * FROM blocks WHERE id = ?").get(result.lastInsertRowid) as Block;
}

export function removeBlock(date: string, time: string): void {
  db.prepare("DELETE FROM blocks WHERE date = ? AND time = ?").run(date, time);
}

export function getAllBlocks(): Block[] {
  return db.prepare("SELECT * FROM blocks ORDER BY date ASC, time ASC").all() as Block[];
}

export function getBlockedSlots(date: string): string[] {
  const rows = db.prepare("SELECT time FROM blocks WHERE date = ?").all(date) as { time: string }[];
  return rows.map(r => r.time);
}

export function isSlotBlocked(date: string, time: string): boolean {
  const row = db.prepare("SELECT 1 FROM blocks WHERE date = ? AND time = ? LIMIT 1").get(date, time);
  return row !== undefined;
}

// ── Patients ───────────────────────────────────────────────────────────────
export interface Patient {
  id: number;
  phone: string;
  name: string;
  email: string | null;
  birth_date: string | null;
  notes: string | null;
  blacklisted: boolean;
  blacklist_reason: string | null;
  created_at: string;
}

function rowToPatient(row: Record<string, unknown>): Patient {
  return { ...(row as Omit<Patient, "blacklisted">), blacklisted: row.blacklisted === 1 };
}

export function getAllPatients(): Patient[] {
  const rows = db.prepare("SELECT * FROM patients ORDER BY name ASC").all() as Record<string, unknown>[];
  return rows.map(rowToPatient);
}

export function getPatientByPhone(phone: string): Patient | undefined {
  const [a, b] = phoneVariants(phone);
  const row = db.prepare("SELECT * FROM patients WHERE phone IN (?, ?) LIMIT 1").get(a, b) as Record<string, unknown> | undefined;
  return row ? rowToPatient(row) : undefined;
}

export function upsertPatient(phone: string, name: string, email?: string): Patient {
  // Always store the canonical (+36...) form so variants deduplicate
  const canonical = normalizePhone(phone);
  db.prepare(
    `INSERT INTO patients (phone, name, email) VALUES (?, ?, ?)
     ON CONFLICT(phone) DO UPDATE SET
       name  = COALESCE(excluded.name,  patients.name),
       email = COALESCE(excluded.email, patients.email)`
  ).run(canonical, name, email ?? null);
  return getPatientByPhone(canonical)!;
}

export function updatePatientProfile(id: number, data: {
  name?: string; email?: string; birth_date?: string | null; notes?: string | null;
}): void {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (data.name       !== undefined) { sets.push("name = ?");       vals.push(data.name); }
  if (data.email      !== undefined) { sets.push("email = ?");      vals.push(data.email); }
  if (data.birth_date !== undefined) { sets.push("birth_date = ?"); vals.push(data.birth_date); }
  if (data.notes      !== undefined) { sets.push("notes = ?");      vals.push(data.notes); }
  if (sets.length === 0) return;
  vals.push(id);
  db.prepare(`UPDATE patients SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
}

export function setBlacklist(id: number, blacklisted: boolean, reason?: string | null): void {
  db.prepare("UPDATE patients SET blacklisted = ?, blacklist_reason = ? WHERE id = ?")
    .run(blacklisted ? 1 : 0, reason ?? null, id);
}

// Normalise HU phone numbers so 06XXXXXXXXX and +36XXXXXXXXX are treated as the same
function normalizePhone(p: string): string {
  const s = p.trim();
  if (s.startsWith("06")) return "+36" + s.slice(2);
  return s;
}
function phoneVariants(phone: string): [string, string] {
  const canonical = normalizePhone(phone);
  const alt = canonical.startsWith("+36") ? "0" + canonical.slice(3) : canonical;
  return [canonical, alt];
}

export function isPhoneBlacklisted(phone: string): boolean {
  const [a, b] = phoneVariants(phone);
  return db.prepare(
    "SELECT 1 FROM patients WHERE phone IN (?, ?) AND blacklisted = 1 LIMIT 1"
  ).get(a, b) !== undefined;
}

export function isEmailBlacklisted(email: string): boolean {
  return db.prepare("SELECT 1 FROM patients WHERE email = ? AND blacklisted = 1 LIMIT 1").get(email) !== undefined;
}

export default db;
