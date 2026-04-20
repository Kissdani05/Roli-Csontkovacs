# Deployment útmutató: Coolify & Hertz

## Migrálás Vercelről

Ez a projekt áttelepítésra került Vercelről a Coolify és Hertz platformokra.

## Módosított fájlok

1. **package.json**
   - Eltávolítva: `vercel` dependency
   - Frissítve: `start` script - PORT environment variable támogatás

2. **next.config.ts**
   - Hozzáadva: `output: "standalone"` - optimalizált Docker deploymenthez

3. **Dockerfile**
   - Multi-stage build (builder + production)
   - Alpine Linux - kisebb image méret
   - Health check beépítve
   - Development nem szükséges függőségek nélkül

4. **coolify.json**
   - Coolify-specifikus konfiguráció

5. **.dockerignore**
   - Docker build optimalizáció

6. **.env.example**
   - Dokumentált environment variablok

## Deployment lépések

### Coolify-n

1. Új projekt létrehozása
2. Git repository kapcsolat
3. Docker image build beállítás
4. Environment variablok beállítása (`.env.example` alapján)
5. Adatbázis és perzisztens tárolón beállítása:
   - `data/` mappát volume-ként csatolni

### Hertz-en

1. Docker image felöltésére vagy közvetlen deployment
2. Environment variablok beállítása
3. Port: 3000 (vagy a Hertz által megadott PORT)
4. Perzisztens tárolón beállítása az `data/` mappához

## Multi-stage build előnyei

- Kisebb Docker image (csak runtime dependencies)
- Gyorsabb deployment
- Biztonságosabb (nem tartalmaz build tools-t)

## Environment variablok

Szükséges a `.env.local` vagy Coolify/Hertz admin panel-ben beállítani:
- See `.env.example`

## Port kezelés

Az alkalmazás a `PORT` environment variable-t támogatja (default: 3000). 
Coolify/Hertz automatikusan beállíthatja ezt.

## Adatbázis

SQLite-ot használ (`data/appointments.db`). Ensure persistence:
- Coolify: Volume mount `data/` mappához
- Hertz: Persistent storage a `data/` mappához

## Egyéb integráció

Az alábbi external servicek-kel működik:
- Google Calendar (Gmail API)
- Szamlazz (számlázás)
- Email (SMTP)

Ezek API kulcsait a `.env.local` vagy admin panel-ben kell beállítani.
