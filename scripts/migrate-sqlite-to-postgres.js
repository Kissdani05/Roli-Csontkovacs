// @ts-check
/**
 * SQLite -> PostgreSQL migrációs script
 * Az összes jogi adatot átmozgatja az SQLite-ból a PostgreSQL-be
 */

const Database = require("better-sqlite3");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const SQLITE_DB_PATH = path.join(process.cwd(), "data/bookings.db");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL nincs beállítva a .env.local-ban!");
  process.exit(1);
}

console.log("🔄 Migrációs script indítása...");
console.log(`📁 SQLite forrás: ${SQLITE_DB_PATH}`);
console.log(`🐘 PostgreSQL cél: ${DATABASE_URL.split("@")[1]}`);

const sqliteDb = new Database(SQLITE_DB_PATH);
const pool = new Pool({ connectionString: DATABASE_URL });

(async () => {
  const pgClient = await pool.connect();
  let migratedBookings = 0;
  let migratedBlocks = 0;
  let migratedPatients = 0;

  try {
    // Táblákat létrehozi PostgreSQL-ben (ha még nem léteznek)
    console.log("\n📋 Táblák létrehozása PostgreSQL-ben...");

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        note TEXT,
        date VARCHAR(10) NOT NULL,
        time VARCHAR(10) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        appeared INTEGER,
        gcal_event_id VARCHAR(255),
        invoice_id VARCHAR(255),
        billing_name VARCHAR(255),
        billing_phone VARCHAR(255),
        billing_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) NOT NULL,
        time VARCHAR(10) NOT NULL,
        reason VARCHAR(255) NOT NULL DEFAULT 'Blokkolt',
        UNIQUE(date, time)
      );
    `);

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        birth_date VARCHAR(10),
        notes TEXT,
        blacklisted INTEGER NOT NULL DEFAULT 0,
        blacklist_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Táblák sikeresen létrehozva!");

    // Bookings migrálása
    console.log("\n📖 Foglalások migrálása...");
    const bookingsStmt = sqliteDb.prepare("SELECT * FROM bookings");
    const bookings = bookingsStmt.all();

    for (const booking of bookings) {
      await pgClient.query(
        `INSERT INTO bookings 
         (id, name, phone, email, note, date, time, status, appeared, gcal_event_id, invoice_id, billing_name, billing_phone, billing_email, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          booking.id,
          booking.name,
          booking.phone,
          booking.email,
          booking.note,
          booking.date,
          booking.time,
          booking.status,
          booking.appeared,
          booking.gcal_event_id,
          booking.invoice_id,
          booking.billing_name,
          booking.billing_phone,
          booking.billing_email,
          booking.created_at || new Date().toISOString(),
        ]
      );
      migratedBookings++;
    }
    console.log(`✅ ${migratedBookings} foglalás migrálva!`);

    // Blocks migrálása
    console.log("\n🚫 Blokkolt időpontok migrálása...");
    const blocksStmt = sqliteDb.prepare("SELECT * FROM blocks");
    const blocks = blocksStmt.all();

    for (const block of blocks) {
      await pgClient.query(
        `INSERT INTO blocks (id, date, time, reason)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (date, time) DO NOTHING`,
        [block.id, block.date, block.time, block.reason]
      );
      migratedBlocks++;
    }
    console.log(`✅ ${migratedBlocks} blokkolt időpont migrálva!`);

    // Patients migrálása
    console.log("\n👥 Páciensek migrálása...");
    const patientsStmt = sqliteDb.prepare("SELECT * FROM patients");
    const patients = patientsStmt.all();

    for (const patient of patients) {
      await pgClient.query(
        `INSERT INTO patients 
         (id, phone, name, email, birth_date, notes, blacklisted, blacklist_reason, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          patient.id,
          patient.phone,
          patient.name,
          patient.email,
          patient.birth_date,
          patient.notes,
          patient.blacklisted,
          patient.blacklist_reason,
          patient.created_at || new Date().toISOString(),
        ]
      );
      migratedPatients++;
    }
    console.log(`✅ ${migratedPatients} páciens migrálva!`);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 MIGRÁCIÓ SIKERES!");
    console.log("=".repeat(50));
    console.log(`📊 Összesen migrálva:`);
    console.log(`   - Foglalások: ${migratedBookings}`);
    console.log(`   - Blokkolt időpontok: ${migratedBlocks}`);
    console.log(`   - Páciensek: ${migratedPatients}`);
    console.log("\n⚠️  FONTOS: Az SQLite adatbázis még mindig létezik az adatokkal!");
    console.log("   Ha már nem lesz rá szükség, szmakadhat törölni: rm data/bookings.db*");

  } catch (error) {
    console.error("❌ Migráció sikertelen:", error.message);
    process.exit(1);
  } finally {
    pgClient.release();
    await pool.end();
    sqliteDb.close();
  }
})();
