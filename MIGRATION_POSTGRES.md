# PostgreSQL Migráció — Lépésenkénti útmutató

## 1. DATABASE_URL beállítása

Az `.env.local` fájlba add hozzá a PostgreSQL adatbázisod kapcsolati stringjét:

```bash
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

## 2. Dependenciák telepítése

```bash
npm install
```

(Már be van) Telepítve: `pg`, `@types/pg`, `dotenv`

## 3. Migrációs script futtatása

```bash
npm run migrate
```

Ez az alábbakat fogja tenni:
- SQLite (`data/bookings.db`) adatok olvasása
- PostgreSQL táblák létrehozása (ha még nem léteznek)
- Összes adat migrálása:
  - **Foglalások** (bookings)
  - **Blokkolt időpontok** (blocks)
  - **Páciensek** (patients)

## 4. Adatbázis cserélődik

A `src/lib/db.ts` már PostgreSQL-re van átállítva:
- ✅ Async/await hívások
- ✅ Connection pooling
- ✅ SSL support
- ✅ Graceful shutdown

## 5. API módosítások

Összes API route módosítva lett az async PostgreSQL hívásokra:
- ✅ `/api/bookings` — insertBooking(), getAllBookings() await
- ✅ `/api/bookings/[id]` — updateBooking(), updateAppearance() await  
- ✅ `/api/bookings/slots` — getOccupiedSlots(), getBlockedSlots() await
- ✅ `/api/blocks` — getAllBlocks(), insertBlock() await
- ✅ `/api/blocks/[date]/[time]` — removeBlock() await
- ✅ `/api/patients` — getAllPatients() await
- ✅ `/api/patients/[id]` — updatePatientProfile(), setBlacklist(), upsertPatient() await

## 6. Tesztelés

```bash
npm run build  # Build teszt
npm run dev    # Development teszt
```

## 7. GitHub push

```bash
git add .
git commit -m "Migration: SQLite → PostgreSQL"
git push origin main
```

A Coolify automatikusan érzékeli és új build indul.

## Biztonsági másolat

Az SQL ite adatbázis előzetes mentve lett:
- `src/lib/db-sqlite-backup.ts` — régi SQLite implementáció
- `data/bookings.db*` — eredeti SQLite fájlok (még mindig léteznek)

Ha szükséges visszaállítás, az adatok még helyreállíthatók!

## Problémamegoldás

**Hiba: "database is locked"**
- Ez már nem fordulhat elő PostgreSQL-lel

**Hiba: "DATABASE_URL nincs beállítva"**
- Ellenőrizd: `.env.local` fájl tartalmazza-e a `DATABASE_URL`?

**Hiba: "connection refused"**
- Ellenőrizd: PostgreSQL szerver fut-e és elérhető a megadott URL-ről?

**Hiba: "table does not exist"**
- Futtasd újra: `npm run migrate`
