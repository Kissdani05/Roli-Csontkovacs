// @ts-check
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(process.cwd(), "data/bookings.db"));

const slots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

const names = [
  "Kovács Anna","Nagy Péter","Tóth Mária","Horváth Gábor","Varga Eszter",
  "Kiss Zoltán","Szabó Katalin","Papp Ádám","Balogh Réka","Fekete Tamás",
  "Molnár Judit","Simon László","Farkas Beáta","Juhász Dávid","Oláh Nikolett",
  "Takács Bence","Pintér Éva","Lukács Márton","Nemes Adrienn","Szűcs Balázs",
  "Bíró Veronika","Hajdú Norbert","Kocsis Tímea","Fehér Kristóf","Hegedűs Lilla",
  "Vásárhelyi Attila","Czibere Zsófia","Barta Roland","Somogyi Petra","Fekete Áron",
];

const phones = [
  "+36301234567","+36701234568","+36201234569","+36301234570","+36701234571",
  "+36201234572","+36301234573","+36701234574","+36201234575","+36301234576",
  "+36701234577","+36201234578","+36301234579","+36701234580","+36201234581",
  "+36301234582","+36701234583","+36201234584","+36301234585","+36701234586",
  "+36701234587","+36201234588","+36301234589","+36701234590","+36201234591",
  "+36301234592","+36701234593","+36201234594","+36301234595","+36701234596",
];

const notes = [
  "Derékfájdalom","Nyakmerevség","Hátfájás","Sportolás utáni feszültség",
  "Fejfájás","Vállproblémák","Deréktáji fájdalom","Gerinc torna után",null,null,
];

const insert = db.prepare(
  "INSERT OR IGNORE INTO bookings (name,phone,email,note,date,time,status,appeared) VALUES (?,?,?,?,?,?,?,?)"
);

const today = new Date("2026-03-29");
const end   = new Date("2026-04-30");

let nameIdx = 0;
let inserted = 0;

for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
  const dow = d.getDay(); // 0=vas, 6=szo
  if (dow === 0) continue; // vasárnap zárva

  const iso = d.toISOString().slice(0, 10);

  // 90% = hétköznap 9 slot, szombat 7 slot
  const fillCount = dow === 6 ? 7 : 9;
  // Véletlenszerűen válasszuk ki a slotokat (nem mindig az elsőket)
  const shuffled = [...slots].sort(() => Math.random() - 0.5).slice(0, fillCount);

  for (const slot of shuffled) {
    const ni = nameIdx % names.length;
    const isPast = d < today;
    const status = isPast ? "confirmed" : (Math.random() < 0.75 ? "confirmed" : "pending");
    const appeared = isPast ? (Math.random() < 0.85 ? 1 : 0) : null;
    const r = insert.run(
      names[ni],
      phones[ni],
      null,
      notes[ni % notes.length],
      iso,
      slot,
      status,
      appeared
    );
    if (r.changes) inserted++;
    nameIdx++;
  }
}

console.log(`Betöltve: ${inserted} foglalás (március 29 – április 30)`);
db.close();
