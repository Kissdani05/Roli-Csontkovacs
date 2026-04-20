import { Pool, QueryResult } from "pg";

// PostgreSQL Pool létrehozása DATABASE_URL-ből
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL szükséges sok cloud hosztolásnál (pl. Coolify, Heroku)
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Elszigetelődés kapcsolatok esetén
pool.on("error", (err) => {
  console.error("Váratlan hiba a PostgreSQL pool-ban:", err);
});

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
  gcal_event_id: string | null;
  invoice_id: string | null;
  billing_name: string | null;
  billing_phone: string | null;
  billing_email: string | null;
  created_at: string;
}

export interface NewBooking {
  name: string;
  phone: string;
  email?: string;
  note?: string;
  date: string;
  time: string;
  billingName?: string;
  billingPhone?: string;
  billingEmail?: string;
}

export interface Patient {
  id: number;
  phone: string;
  name: string;
  email: string | null;
  birth_date: string | null;
  notes: string | null;
  blacklisted: number;
  blacklist_reason: string | null;
  created_at: string;
}

export interface Block {
  id: number;
  date: string;
  time: string;
  reason: string;
}

// ============ BOOKINGS ============

export function getBookingById(id: number): Booking | null {
  const client = pool;
  try {
    const result = client.querySync(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    ) as QueryResult<Booking>;
    return result.rows[0] || null;
  } catch (err) {
    console.error("[getBookingById]", err);
    throw err;
  }
}

export async function insertBooking(booking: NewBooking, status = "pending"): Promise<Booking> {
  const client = await pool.connect();
  try {
    const result = await client.query<Booking>(
      `INSERT INTO bookings (name, phone, email, note, date, time, status, billing_name, billing_phone, billing_email, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        booking.name,
        booking.phone,
        booking.email || null,
        booking.note || null,
        booking.date,
        booking.time,
        status,
        booking.billingName || null,
        booking.billingPhone || null,
        booking.billingEmail || null,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<Booking>(
      "SELECT * FROM bookings ORDER BY date DESC, time DESC"
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<Booking> {
  const client = await pool.connect();
  try {
    const result = await client.query<Booking>(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateBooking(
  id: number,
  { name, phone, email, note, date, time }: Partial<NewBooking>
): Promise<Booking> {
  const client = await pool.connect();
  try {
    const result = await client.query<Booking>(
      `UPDATE bookings SET name = COALESCE($1, name), phone = COALESCE($2, phone), 
       email = COALESCE($3, email), note = COALESCE($4, note), 
       date = COALESCE($5, date), time = COALESCE($6, time) 
       WHERE id = $7 RETURNING *`,
      [name, phone, email, note, date, time, id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateAppearance(id: number, appeared: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("UPDATE bookings SET appeared = $1 WHERE id = $2", [appeared, id]);
  } finally {
    client.release();
  }
}

export async function updateInvoiceId(id: number, invoiceId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("UPDATE bookings SET invoice_id = $1 WHERE id = $2", [invoiceId, id]);
  } finally {
    client.release();
  }
}

export async function updateGcalEventId(id: number, gcalEventId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("UPDATE bookings SET gcal_event_id = $1 WHERE id = $2", [
      gcalEventId,
      id,
    ]);
  } finally {
    client.release();
  }
}

// ============ BLOCKS ============

export async function getAllBlocks(): Promise<Block[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<Block>(
      "SELECT * FROM blocks ORDER BY date, time"
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function insertBlock(date: string, time: string, reason = "Blokkolt"): Promise<Block> {
  const client = await pool.connect();
  try {
    const result = await client.query<Block>(
      "INSERT INTO blocks (date, time, reason) VALUES ($1, $2, $3) RETURNING *",
      [date, time, reason]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function removeBlock(date: string, time: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM blocks WHERE date = $1 AND time = $2", [date, time]);
  } finally {
    client.release();
  }
}

export async function getBlockedSlots(date: string): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ time: string }>(
      "SELECT time FROM blocks WHERE date = $1 ORDER BY time",
      [date]
    );
    return result.rows.map(row => row.time);
  } finally {
    client.release();
  }
}

// ============ PATIENTS ============

export async function getAllPatients(): Promise<Patient[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<Patient>(
      "SELECT * FROM patients ORDER BY created_at DESC"
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getPatientByPhone(phone: string): Promise<Patient | null> {
  const client = await pool.connect();
  try {
    const result = await client.query<Patient>(
      "SELECT * FROM patients WHERE phone = $1",
      [phone]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function upsertPatient(phone: string, name: string, email?: string): Promise<Patient> {
  const client = await pool.connect();
  try {
    const result = await client.query<Patient>(
      `INSERT INTO patients (phone, name, email, created_at) VALUES ($1, $2, $3, NOW())
       ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
       RETURNING *`,
      [phone, name, email || null]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updatePatientProfile(
  id: number,
  { name, email, birth_date, notes }: Partial<Patient>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE patients SET 
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       birth_date = COALESCE($3, birth_date),
       notes = COALESCE($4, notes)
       WHERE id = $5`,
      [name, email, birth_date, notes, id]
    );
  } finally {
    client.release();
  }
}

export async function setBlacklist(
  id: number,
  blacklisted: number,
  reason?: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE patients SET blacklisted = $1, blacklist_reason = $2 WHERE id = $3",
      [blacklisted, reason || null, id]
    );
  } finally {
    client.release();
  }
}

// ============ BOOKING SLOTS ============

export async function getOccupiedSlots(date: string): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ time: string }>(
      "SELECT DISTINCT time FROM bookings WHERE date = $1 AND status IN ('pending', 'confirmed')",
      [date]
    );
    return result.rows.map(row => row.time);
  } finally {
    client.release();
  }
}

export async function isSlotTaken(date: string, time: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM bookings WHERE date = $1 AND time = $2 AND status IN ('pending', 'confirmed')",
      [date, time]
    );
    return parseInt(result.rows[0]?.count || "0", 10) > 0;
  } finally {
    client.release();
  }
}

export async function isSlotBlocked(date: string, time: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM blocks WHERE date = $1 AND time = $2",
      [date, time]
    );
    return parseInt(result.rows[0]?.count || "0", 10) > 0;
  } finally {
    client.release();
  }
}

// ============ VALIDATION ============

export async function isPhoneBlacklisted(phone: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ blacklisted: number }>(
      "SELECT blacklisted FROM patients WHERE phone = $1",
      [phone]
    );
    return result.rows[0]?.blacklisted === 1;
  } finally {
    client.release();
  }
}

export async function isEmailBlacklisted(email: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE email = $1 AND status = 'cancelled' 
       GROUP BY email HAVING COUNT(*) > 2`,
      [email]
    );
    return parseInt(result.rows[0]?.count || "0", 10) > 2;
  } finally {
    client.release();
  }
}

// Pool lezárása (graceful shutdown)
process.on("exit", async () => {
  await pool.end();
});
