"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import AnalyticsPanel from "./AnalyticsPanel";

// ── types ────────────────────────────────────────────────────────────────────
type BookingStatus = "pending" | "confirmed" | "cancelled";
type Booking = {
  id: number; date: string; time: string;
  name: string; phone: string; email: string | null; note: string | null;
  status: BookingStatus; appeared: number | null; created_at: string;
  invoice_id: string | null;
};
type BlockItem = { id: number; date: string; time: string; reason: string; };
type Patient = {
  id: number; phone: string; name: string; email: string | null;
  birth_date: string | null; notes: string | null;
  blacklisted: boolean; blacklist_reason: string | null; created_at: string;
};

// ── constants ────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00",
];
const HU_MONTHS = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December",
];
const HU_DAYS = ["H","K","Sz","Cs","P","Szo","V"];
const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Függőben", confirmed: "Megerősítve", cancelled: "Elutasítva",
};
const STATUS_COLOR: Record<BookingStatus, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};
const ROW_BG: Record<BookingStatus, string> = {
  pending:   "bg-amber-50",
  confirmed: "bg-emerald-50",
  cancelled: "",
};

function toISO(d: Date): string {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
}
function fmtDate(iso: string) {
  const [y,m,d] = iso.split("-");
  return `${y}. ${m}. ${d}.`;
}
// Normalise HU phone numbers: 06XXXXXXXXX ↔ +36XXXXXXXXX → canonical +36...
function normalizePhone(raw: string): string {
  const s = raw.trim();
  if (s.startsWith("06")) return "+36" + s.slice(2);
  return s;
}

// ── component ────────────────────────────────────────────────────────────────
export default function AdminClient({ bookings: initial }: { bookings: Booking[] }) {
  const today = new Date();

  // ── tabs ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"calendar" | "patients" | "analytics">("calendar");

  // ── bookings ──────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>(initial);

  // ── blocks ────────────────────────────────────────────────────────────────
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  useEffect(() => {
    fetch("/api/blocks").then(r => r.json()).then(d => setBlocks(d.blocks ?? []));
  }, []);

  // ── patients ─────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  useEffect(() => {
    fetch("/api/patients").then(r => r.json()).then(d => setPatients(d.patients ?? []));
  }, []);

  // ── calendar nav ──────────────────────────────────────────────────────────
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDate,  setSelDate]  = useState<Date>(today);
  const [hlSlot,   setHlSlot]   = useState<string | null>(null);

  // ── search ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIdx,   setSearchIdx]   = useState(0);
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return bookings.filter(b => b.status !== "cancelled" && b.name.toLowerCase().includes(q));
  }, [bookings, searchQuery]);
  useEffect(() => { setSearchIdx(0); }, [searchQuery]);
  function jumpToResult(idx: number) {
    const b = searchResults[idx]; if (!b) return;
    const d = new Date(b.date + "T00:00:00");
    setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setSelDate(d);
    setHlSlot(b.time); setTimeout(() => setHlSlot(null), 4500);
  }
  useEffect(() => {
    if (searchResults.length > 0) jumpToResult(searchIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchIdx, searchResults]);

  // ── DnD ───────────────────────────────────────────────────────────────────
  const [dragId,   setDragId]   = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // ── Megjelent? ────────────────────────────────────────────────────────────
  const [appearPending, setAppearPending] = useState<number | null>(null); // booking id under prompt
  async function markAppearance(bookingId: number, appeared: boolean) {
    setAppearPending(null);
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appeared }),
    });
    if (res.ok) {
      const d = await res.json() as { booking: Booking };
      setBookings(prev => prev.map(b => b.id === bookingId ? d.booking : b));
    }
  }

  async function handleDrop(targetSlot: string) {
    if (dragId === null) return;
    const b = bookings.find(bk => bk.id === dragId);
    if (!b || b.time === targetSlot) { setDragId(null); setDragOver(null); return; }
    const res = await fetch(`/api/bookings/${dragId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, time: targetSlot }),
    });
    if (res.ok) {
      const d = await res.json();
      setBookings(prev => prev.map(bk => bk.id === dragId ? (d as { booking: Booking }).booking : bk));
    }
    setDragId(null); setDragOver(null);
  }

  // ── block modal ───────────────────────────────────────────────────────────
  const [showBlock,    setShowBlock]    = useState(false);
  const [blockSlot,    setBlockSlot]    = useState("");
  const [blockReason,  setBlockReason]  = useState("Blokkolt");
  const [blockLoading, setBlockLoading] = useState(false);
  const blockReasonRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (showBlock) setTimeout(() => blockReasonRef.current?.focus(), 50); }, [showBlock]);

  async function submitBlock(e: React.FormEvent) {
    e.preventDefault(); setBlockLoading(true);
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: toISO(selDate), time: blockSlot, reason: blockReason }),
    });
    if (res.ok) { const d = await res.json(); setBlocks(prev => [...prev, (d as { block: BlockItem }).block]); }
    setShowBlock(false); setBlockLoading(false);
  }
  async function unblock(bl: BlockItem) {
    const res = await fetch(`/api/blocks/${bl.date}/${encodeURIComponent(bl.time)}`, { method: "DELETE" });
    if (res.ok) setBlocks(prev => prev.filter(b => b.id !== bl.id));
  }

  // ── confirm dialog ────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState<{ id: number; status: BookingStatus; label: string } | null>(null);
  useEffect(() => {
    if (!confirm) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Enter") { e.preventDefault(); doConfirm(); } }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm]);
  function askConfirm(id: number, status: BookingStatus) {
    setConfirm({ id, status, label: status === "confirmed" ? "elfogadod" : "elutasítod" });
  }
  async function doConfirm() {
    if (!confirm) return;
    const { id, status } = confirm; setConfirm(null);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  // ── new booking ───────────────────────────────────────────────────────────
  const [showNew,    setShowNew]    = useState(false);
  const [newDate,    setNewDate]    = useState(toISO(today));
  const [newTime,    setNewTime]    = useState("08:00");
  const [newName,    setNewName]    = useState("");
  const [newPhone,   setNewPhone]   = useState("");
  const [newEmail,   setNewEmail]   = useState("");
  const [newNote,    setNewNote]    = useState("");
  const [newLoading, setNewLoading] = useState(false);
  const [newError,   setNewError]   = useState("");
  const newOccupied = useMemo(
    () => new Set(bookings.filter(b => b.date === newDate && b.status !== "cancelled").map(b => b.time)),
    [bookings, newDate]
  );
  function openNew(presetTime?: string) {
    setNewDate(toISO(selDate)); setNewTime(presetTime ?? "08:00");
    setNewName(""); setNewPhone(""); setNewEmail(""); setNewNote(""); setNewError("");
    setShowNew(true);
  }
  async function submitNew(e: React.FormEvent) {
    e.preventDefault(); setNewLoading(true); setNewError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, time: newTime, name: newName, phone: newPhone, email: newEmail, note: newNote, adminCreated: true }),
      });
      if (!res.ok) { setNewError(((await res.json()) as { error?: string }).error ?? "Hiba."); return; }
      const d = await res.json();
      setBookings(prev => [...prev, (d as { booking: Booking }).booking]);
      setShowNew(false);
    } catch { setNewError("Hálózati hiba."); }
    finally { setNewLoading(false); }
  }

  // ── edit booking ──────────────────────────────────────────────────────────
  const [showEdit,    setShowEdit]    = useState(false);
  const [editId,      setEditId]      = useState(0);
  const [editDate,    setEditDate]    = useState(toISO(today));
  const [editTime,    setEditTime]    = useState("08:00");
  const [editName,    setEditName]    = useState("");
  const [editPhone,   setEditPhone]   = useState("");
  const [editEmail,   setEditEmail]   = useState("");
  const [editNote,    setEditNote]    = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError,   setEditError]   = useState("");
  const editOccupied = useMemo(
    () => new Set(bookings.filter(b => b.date === editDate && b.status !== "cancelled" && b.id !== editId).map(b => b.time)),
    [bookings, editDate, editId]
  );
  function openEdit(b: Booking) {
    setEditId(b.id); setEditDate(b.date); setEditTime(b.time);
    setEditName(b.name); setEditPhone(b.phone); setEditEmail(b.email ?? ""); setEditNote(b.note ?? "");
    setEditError(""); setShowEdit(true);
  }
  async function submitEdit(e: React.FormEvent) {
    e.preventDefault(); setEditLoading(true); setEditError("");
    try {
      const res = await fetch(`/api/bookings/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: editDate, time: editTime, name: editName, phone: editPhone, email: editEmail, note: editNote }),
      });
      if (!res.ok) { setEditError(((await res.json()) as { error?: string }).error ?? "Hiba."); return; }
      const d = await res.json();
      setBookings(prev => prev.map(b => b.id === editId ? (d as { booking: Booking }).booking : b));
      setShowEdit(false);
    } catch { setEditError("Hálózati hiba."); }
    finally { setEditLoading(false); }
  }

  // ── body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = (showNew || showEdit || showBlock || !!confirm) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showNew, showEdit, showBlock, confirm]);

  // ── computed ──────────────────────────────────────────────────────────────
  const selISO = toISO(selDate);
  const dayBookings = useMemo(
    () => bookings.filter(b => b.date === selISO && b.status !== "cancelled"),
    [bookings, selISO]
  );
  const datesWithBookings = useMemo(() => {
    const s = new Set<string>();
    bookings.filter(b => b.status !== "cancelled").forEach(b => s.add(b.date));
    return s;
  }, [bookings]);
  const calCells = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calYear, calMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calYear, calMonth]);
  const stats = useMemo(() => ({
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  function goToNextFreeSlot() {
    const now = new Date();
    for (let delta = 0; delta < 60; delta++) {
      const c = new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta);
      if (c.getDay() === 0 || c.getDay() === 6) continue;
      const iso = toISO(c);
      const occupied = new Set([
        ...bookings.filter(b => b.date === iso && b.status !== "cancelled").map(b => b.time),
        ...blocks.filter(bl => bl.date === iso).map(bl => bl.time),
      ]);
      for (const slot of TIME_SLOTS) {
        if (occupied.has(slot)) continue;
        if (delta === 0) {
          const [h, m] = slot.split(":").map(Number);
          if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) continue;
        }
        setCalYear(c.getFullYear()); setCalMonth(c.getMonth()); setSelDate(c);
        setHlSlot(slot); setTimeout(() => setHlSlot(null), 4500); return;
      }
    }
  }

  // ── patient tab helpers ───────────────────────────────────────────────────
  const [patSearch,  setPatSearch]  = useState("");
  const [selPatId,   setSelPatId]   = useState<string | null>(null); // phone as key
  const [patNotes,   setPatNotes]   = useState("");
  const [patBirth,   setPatBirth]   = useState("");
  const [patSaving,  setPatSaving]  = useState(false);
  const [patSaved,   setPatSaved]   = useState(false);
  const [showBLModal,  setShowBLModal]  = useState(false);
  const [blReason,     setBlReason]     = useState("");
  const [blTargetPhone, setBlTargetPhone] = useState("");

  // Derived patient list from bookings + patients table
  const allPatients = useMemo(() => {
    const byPhone = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const key = normalizePhone(b.phone);
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key)!.push(b);
    });
    return Array.from(byPhone.entries()).map(([phone, bks]) => {
      // Match patients record by either form of the number (06... vs +36...)
      const patRec = patients.find(p => normalizePhone(p.phone) === phone);
      const latest  = bks.sort((a, b) => a.date > b.date ? -1 : 1)[0];
      const active  = bks.filter(b => b.status !== "cancelled");
      const lastVisit = active.sort((a, b) => a.date > b.date ? -1 : 1)[0]?.date ?? null;
      return {
        phone,
        name:             patRec?.name             ?? latest.name,
        email:            patRec?.email            ?? latest.email ?? null,
        birth_date:       patRec?.birth_date        ?? null,
        notes:            patRec?.notes             ?? null,
        blacklisted:      patRec?.blacklisted       ?? false,
        blacklist_reason: patRec?.blacklist_reason  ?? null,
        patId:            patRec?.id                ?? null,
        totalBookings:    bks.length,
        confirmedVisits:  active.length,
        lastVisit,
        history:          bks.sort((a, b) => a.date > b.date ? -1 : 1),
      };
    }).sort((a, b) => a.name.localeCompare(b.name, "hu"));
  }, [bookings, patients]);

  const filteredPatients = useMemo(() => {
    const q = patSearch.trim().toLowerCase();
    if (!q) return allPatients;
    return allPatients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.phone.startsWith("+36") && ("0" + p.phone.slice(3)).includes(q)) ||
      (p.phone.startsWith("06")  && ("+36" + p.phone.slice(2)).includes(q))
    );
  }, [allPatients, patSearch]);

  const selPat = selPatId ? allPatients.find(p => p.phone === selPatId) ?? null : null;

  function openPatient(phone: string) {
    const p = allPatients.find(p => p.phone === phone);
    setSelPatId(phone);
    setPatNotes(p?.notes ?? "");
    setPatBirth(p?.birth_date ?? "");
    setPatSaved(false);
  }

  async function savePatient() {
    if (!selPat) return;
    setPatSaving(true);
    // Ensure patient record exists
    const upsertRes = await fetch("/api/patients/0", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: selPat.phone, name: selPat.name, email: selPat.email }),
    });
    if (!upsertRes.ok) { setPatSaving(false); return; }
    const { patient } = await upsertRes.json() as { patient: Patient };
    // Update profile
    await fetch(`/api/patients/${patient.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: patNotes, birth_date: patBirth || null }),
    });
    // Refresh patients
    const fresh = await fetch("/api/patients").then(r => r.json());
    setPatients(fresh.patients ?? []);
    setPatSaving(false); setPatSaved(true);
    setTimeout(() => setPatSaved(false), 2000);
  }

  async function doBlacklist(phone: string, blacklisted: boolean) {
    // Ensure patient record exists first
    const pat = allPatients.find(p => p.phone === phone);
    if (!pat) return;
    const upsertRes = await fetch("/api/patients/0", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: pat.phone, name: pat.name, email: pat.email }),
    });
    if (!upsertRes.ok) return;
    const { patient } = await upsertRes.json() as { patient: Patient };
    await fetch(`/api/patients/${patient.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blacklisted, blacklist_reason: blacklisted ? blReason : null }),
    });
    const fresh = await fetch("/api/patients").then(r => r.json());
    setPatients(fresh.patients ?? []);
    setShowBLModal(false); setBlReason("");
  }

  // ── shared slot-grid JSX (used in both new + edit modals) ─────────────────
  function SlotGrid({ selected, occupied, onSelect }: {
    selected: string;
    occupied: Set<string>;
    onSelect: (s: string) => void;
  }) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {TIME_SLOTS.map(slot => {
          const taken = occupied.has(slot);
          return (
            <button key={slot} type="button" disabled={taken} onClick={() => !taken && onSelect(slot)}
              title={taken ? "Ez az időpont már foglalt" : undefined}
              className={`py-2 rounded-xl text-sm font-medium transition-all leading-tight
                ${taken ? "bg-red-50 text-red-400 cursor-not-allowed line-through"
                  : selected === slot ? "bg-[#1A4B82] text-white"
                  : "bg-[#E7F1F8] text-[#4C6579] hover:bg-[#C3D4E3]"}`}
            >
              {slot}
              {taken && <span className="block text-[9px]" style={{textDecoration:"none"}}>Foglalt</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F8FB] p-4 md:p-6">

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Link href="/" className="text-sm font-medium text-[#4C6579] hover:text-[#1A4B82] transition-colors">
          ← Vissza a Főoldalra
        </Link>
        <div className="flex gap-2 ml-auto flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white shadow-sm text-xs font-medium text-[#4C6579]">Összes: {stats.all}</span>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-xs font-medium text-amber-700">Függő: {stats.pending}</span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">Elfogadva: {stats.confirmed}</span>
          <span className="px-3 py-1 rounded-full bg-red-100 text-xs font-medium text-red-600">Elutasítva: {stats.cancelled}</span>
        </div>
        <button onClick={goToNextFreeSlot}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0E9DB8] text-white hover:bg-[#0c8ca5] transition-colors shadow-sm">
          Legközelebbi szabad időpont
        </button>
        <button onClick={() => openNew()}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A4B82] text-white hover:bg-[#153d6e] transition-colors shadow-sm">
          + Új foglalás
        </button>
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit shadow-sm border border-[#C3D4E3]">
        {(["calendar","patients","analytics"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
              ${tab === t ? "bg-[#1A4B82] text-white shadow-sm" : "text-[#4C6579] hover:bg-[#E7F1F8]"}`}>
            {t === "calendar" ? "📅 Naptár" : t === "patients" ? "👤 Páciensek" : "📊 Analitikák"}
          </button>
        ))}
      </div>

      {tab === "calendar" && (
        <>
          {/* ── Search bar ────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4C6579]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Keresés név alapján..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#C3D4E3] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30 placeholder:text-[#C3D4E3]" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setHlSlot(null); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4C6579] hover:text-[#1A4B82] text-lg leading-none">✕</button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#4C6579]">{searchIdx+1} / {searchResults.length}</span>
                <button onClick={() => setSearchIdx(i => (i-1+searchResults.length) % searchResults.length)}
                  disabled={searchResults.length <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#C3D4E3] text-[#4C6579] hover:bg-[#E7F1F8] disabled:opacity-30 text-sm">←</button>
                <button onClick={() => setSearchIdx(i => (i+1) % searchResults.length)}
                  disabled={searchResults.length <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#C3D4E3] text-[#4C6579] hover:bg-[#E7F1F8] disabled:opacity-30 text-sm">→</button>
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <span className="text-xs text-[#4C6579] italic">Nincs találat</span>
            )}
          </div>

          {/* ── Main calendar grid ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">

            {/* Mini calendar */}
            <div className="bg-white rounded-2xl shadow-sm p-4 self-start">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => { if (calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E7F1F8] text-[#4C6579] text-lg">‹</button>
                <span className="text-sm font-semibold text-[#1A4B82]">{calYear} {HU_MONTHS[calMonth]}</span>
                <button onClick={() => { if (calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E7F1F8] text-[#4C6579] text-lg">›</button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {HU_DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-[#4C6579] pb-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {calCells.map((cell, i) => {
                  if (!cell) return <div key={i} />;
                  const iso = toISO(cell);
                  const isToday   = toISO(today) === iso;
                  const isSel     = toISO(selDate) === iso;
                  const hasDot    = datesWithBookings.has(iso);
                  const isWeekend = cell.getDay()===0 || cell.getDay()===6;
                  return (
                    <button key={i} onClick={() => !isWeekend && setSelDate(cell)} disabled={isWeekend}
                      className={`relative flex flex-col items-center justify-center aspect-square rounded-full text-xs font-medium transition-all
                        ${isWeekend ? "text-[#C3D4E3] cursor-not-allowed"
                          : isSel    ? "bg-[#1A4B82] text-white"
                          : isToday  ? "bg-[#E7F1F8] text-[#1A4B82] font-bold"
                                     : "hover:bg-[#E7F1F8] text-[#4C6579]"}`}>
                      {cell.getDate()}
                      {hasDot && !isWeekend && (
                        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSel?"bg-white":"bg-[#0E9DB8]"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day timeline */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#C3D4E3]">
                <h2 className="text-base font-semibold text-[#1A4B82]">
                  {selDate.toLocaleDateString("hu-HU", { year:"numeric",month:"long",day:"numeric",weekday:"long" })}
                </h2>
              </div>
              {(selDate.getDay()===0 || selDate.getDay()===6) ? (
                <div className="px-5 py-12 text-center text-[#4C6579] text-sm">Hétvégén nincs rendelés.</div>
              ) : (
                <div className="divide-y divide-[#E7F1F8]">
                  {TIME_SLOTS.map(slot => {
                    const booking       = dayBookings.find(b => b.time === slot);
                    const block         = blocks.find(bl => bl.date === selISO && bl.time === slot);
                    const isHighlighted = hlSlot === slot;
                    const isDragTarget  = dragId !== null && !booking && !block && dragOver === slot;

                    return (
                      <div key={slot}
                        className={`flex items-start gap-4 px-5 py-3.5 transition-all duration-200
                          ${booking ? ROW_BG[booking.status] : ""}
                          ${isHighlighted ? "bg-amber-50 ring-2 ring-inset ring-amber-300 animate-pulse" : ""}
                          ${isDragTarget  ? "bg-blue-50 ring-2 ring-inset ring-blue-300" : ""}
                          ${!booking && !block ? "hover:bg-[#F4F8FB] cursor-pointer group" : ""}
                        `}
                        onClick={() => { if (!booking && !block) openNew(slot); }}
                        onDragOver={e => { if (dragId !== null && !booking && !block) { e.preventDefault(); setDragOver(slot); } }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => { e.preventDefault(); handleDrop(slot); }}
                      >
                        <div className={`w-12 text-sm font-mono font-semibold shrink-0 mt-0.5 ${booking ? "text-[#1A4B82]" : "text-[#4C6579] group-hover:text-[#0E9DB8]"}`}>
                          {slot}
                        </div>

                        {booking ? (
                          <div className="flex-1 min-w-0"
                            draggable
                            onDragStart={e => { e.dataTransfer.setData("text/plain", booking.id.toString()); setDragId(booking.id); }}
                            onDragEnd={() => { setDragId(null); setDragOver(null); }}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#1A4B82] cursor-grab">{booking.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[booking.status]}`}>
                                {STATUS_LABEL[booking.status]}
                              </span>
                              {/* Megjelenés jelzője ha már rögzítve */}
                              {booking.appeared === 1 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">✓ Megjelent</span>
                              )}
                              {booking.appeared === 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">✗ Nem jelent meg</span>
                              )}
                              {booking.invoice_id && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700" title={`Számlaszám: ${booking.invoice_id}`}>
                                  🧾 {booking.invoice_id}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#4C6579] mt-0.5 space-x-3">
                              <span>{booking.phone}</span>
                              {booking.email && <span>{booking.email}</span>}
                            </div>
                            {booking.note && <p className="text-xs text-[#4C6579] mt-1 italic">{booking.note}</p>}
                            {booking.status !== "cancelled" && (
                              <div className="flex gap-2 mt-2 flex-wrap items-center">
                                {booking.status !== "confirmed" && (
                                  <button onClick={e => { e.stopPropagation(); askConfirm(booking.id,"confirmed"); }}
                                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Elfogad</button>
                                )}
                                <button onClick={e => { e.stopPropagation(); askConfirm(booking.id,"cancelled"); }}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">Elutasít</button>
                                <button onClick={e => { e.stopPropagation(); openEdit(booking); }}
                                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#E7F1F8] text-[#1A4B82] hover:bg-[#C3D4E3] transition-colors">Módosít</button>
                                {/* Megjelent? — ha az időpont már elmúlt (múltbeli nap vagy mai elkezdett slot) */}
                                {(() => {
                                  const now = new Date();
                                  const todayISO = toISO(now);
                                  const [bh, bm] = booking.time.split(":").map(Number);
                                  const isPastDay = booking.date < todayISO;
                                  const isTodayStarted = booking.date === todayISO &&
                                    (now.getHours() > bh || (now.getHours() === bh && now.getMinutes() >= bm));
                                  const slotStarted = isPastDay || isTodayStarted;
                                  if (!slotStarted || booking.appeared !== null) return null;
                                  if (appearPending === booking.id) return (
                                    <span className="flex items-center gap-1 ml-1">
                                      <span className="text-xs text-[#4C6579] font-semibold">Megjelent?</span>
                                      <button onClick={e => { e.stopPropagation(); markAppearance(booking.id, true); }}
                                        className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Igen</button>
                                      <button onClick={e => { e.stopPropagation(); markAppearance(booking.id, false); }}
                                        className="px-3 py-1 text-xs font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Nem</button>
                                      <button onClick={e => { e.stopPropagation(); setAppearPending(null); }}
                                        className="px-2 py-1 text-xs rounded-lg text-[#4C6579] hover:bg-[#E7F1F8] transition-colors">✕</button>
                                    </span>
                                  );
                                  return (
                                    <button onClick={e => { e.stopPropagation(); setAppearPending(booking.id); }}
                                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors ml-1">
                                      Megjelent?
                                    </button>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ) : block ? (
                          <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1">
                              <span className="text-xs font-semibold text-[#4C6579]">🔒 Blokkolt</span>
                              <span className="ml-2 text-xs text-[#4C6579] italic">{block.reason}</span>
                            </div>
                            <button onClick={e => { e.stopPropagation(); unblock(block); }}
                              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#E7F1F8] text-[#4C6579] hover:bg-[#C3D4E3] transition-colors shrink-0">
                              Felold
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm text-[#C3D4E3] group-hover:text-[#0E9DB8] transition-colors select-none">
                              Szabad — kattints az időpont hozzáadásához
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); setBlockSlot(slot); setBlockReason("Blokkolt"); setShowBlock(true); }}
                              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#E7F1F8] text-[#4C6579] hover:bg-[#C3D4E3] transition-all shrink-0 ml-2">
                              🔒 Blokkol
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "patients" && (
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6">
          {/* Patient list */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden self-start">
            <div className="px-4 py-3 border-b border-[#C3D4E3]">
              <input type="text" placeholder="Keresés név / telefonszám..."
                value={patSearch} onChange={e => setPatSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
            </div>
            {filteredPatients.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#4C6579]">Nincs találat.</div>
            ) : (
              <ul className="divide-y divide-[#E7F1F8] max-h-[70vh] overflow-y-auto">
                {filteredPatients.map(p => (
                  <li key={p.phone}>
                    <button onClick={() => openPatient(p.phone)} className={`w-full text-left px-4 py-3 hover:bg-[#F4F8FB] transition-colors
                      ${selPatId === p.phone ? "bg-[#E7F1F8]" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A4B82] flex-1">{p.name}</span>
                        {p.blacklisted && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">Tiltott</span>
                        )}
                      </div>
                      <div className="text-xs text-[#4C6579] mt-0.5">{p.phone}</div>
                      <div className="text-xs text-[#4C6579] mt-0.5">
                        {p.confirmedVisits} látogatás{p.lastVisit ? ` • utoljára: ${fmtDate(p.lastVisit)}` : ""}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Patient detail */}
          {selPat ? (
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1A4B82]">{selPat.name}</h2>
                  <div className="text-sm text-[#4C6579] mt-0.5 space-x-3">
                    <span>{selPat.phone}</span>
                    {selPat.email && <span>{selPat.email}</span>}
                  </div>
                  <div className="mt-1 text-xs text-[#4C6579]">
                    <span className="font-semibold">{selPat.confirmedVisits}</span> aktív látogatás •{" "}
                    <span className="font-semibold">{selPat.totalBookings}</span> foglalás összesen
                    {selPat.lastVisit && <span> • Utolsó látogatás: <span className="font-semibold">{fmtDate(selPat.lastVisit)}</span></span>}
                  </div>
                </div>
                {selPat.blacklisted ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">⛔ Tiltólistán</span>
                    {selPat.blacklist_reason && <span className="text-xs text-[#4C6579] italic">{selPat.blacklist_reason}</span>}
                    <button onClick={() => doBlacklist(selPat.phone, false)}
                      className="mt-1 px-3 py-1 text-xs font-semibold rounded-lg bg-[#E7F1F8] text-[#1A4B82] hover:bg-[#C3D4E3] transition-colors">
                      Tiltás feloldása
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setBlTargetPhone(selPat.phone); setBlReason(""); setShowBLModal(true); }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    ⛔ Tiltólistára
                  </button>
                )}
              </div>

              {/* Születési dátum */}
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Születési dátum</label>
                <input type="date" value={patBirth} onChange={e => setPatBirth(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Privát jegyzetek / Anamnézis</label>
                <textarea rows={5} value={patNotes} onChange={e => setPatNotes(e.target.value)}
                  placeholder="Panaszok, alkalmazott technikák, egyéb megjegyzések..."
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30 resize-none" />
              </div>
              <button onClick={savePatient} disabled={patSaving}
                className="px-4 py-2 rounded-xl bg-[#1A4B82] text-white text-sm font-bold hover:bg-[#153d6e] disabled:opacity-60 transition-colors">
                {patSaving ? "Mentés..." : patSaved ? "✓ Elmentve!" : "Adatok mentése"}
              </button>

              {/* Treatment history */}
              <div>
                <h3 className="text-sm font-semibold text-[#1A4B82] mb-2">Kezelési előzmények</h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {selPat.history.map(b => (
                    <div key={b.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${ROW_BG[b.status] || "bg-[#F4F8FB]"}`}>
                      <span className="font-mono font-semibold text-[#1A4B82] shrink-0">{fmtDate(b.date)} {b.time}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                      {b.note && <span className="text-[#4C6579] italic truncate">{b.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm flex items-center justify-center h-48 text-sm text-[#4C6579]">
              Válassz egy páciense a listából.
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && <AnalyticsPanel bookings={bookings} />}

      {/* ── Confirm dialog ──────────────────────────────────────── */}
      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-[#1A4B82] mb-2">Megerősítés szükséges</h3>
            <p className="text-sm text-[#4C6579] mb-6">
              Biztosan <span className="font-semibold text-[#1A4B82]">{confirm.label}</span> ezt az időpontot?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#C3D4E3] text-[#4C6579] hover:bg-[#E7F1F8] transition-colors">Mégsem</button>
              <button autoFocus onClick={doConfirm}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors ${confirm.status==="confirmed" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}>
                Igen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Block modal ─────────────────────────────────────────── */}
      {showBlock && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[#1A4B82] mb-4">Időpont blokkolása</h3>
            <p className="text-xs text-[#4C6579] mb-4">{toISO(selDate)} — {blockSlot}</p>
            <form onSubmit={submitBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Indok</label>
                <input ref={blockReasonRef} type="text" required value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBlock(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border border-[#C3D4E3] text-[#4C6579] hover:bg-[#E7F1F8] transition-colors">Mégsem</button>
                <button type="submit" disabled={blockLoading}
                  className="flex-1 py-2 rounded-xl bg-[#1A4B82] text-white text-sm font-bold hover:bg-[#153d6e] disabled:opacity-60 transition-colors">
                  {blockLoading ? "..." : "Blokkol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Blacklist modal ─────────────────────────────────────── */}
      {showBLModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-red-600 mb-2">Tiltólistára helyezés</h3>
            <p className="text-sm text-[#4C6579] mb-4">Ez a páciens ezután nem tud időpontot foglalni.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Indok (opcionális)</label>
                <input type="text" value={blReason} onChange={e => setBlReason(e.target.value)}
                  placeholder="pl. 3x nem jelent meg..."
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowBLModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border border-[#C3D4E3] text-[#4C6579] hover:bg-[#E7F1F8] transition-colors">Mégsem</button>
                <button onClick={() => doBlacklist(blTargetPhone, true)}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
                  Tiltólistára
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New booking modal ────────────────────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowNew(false)} className="absolute top-4 right-4 text-[#4C6579] hover:text-[#1A4B82] text-xl font-bold leading-none" aria-label="Bezárás">✕</button>
            <h3 className="text-lg font-bold text-[#1A4B82] mb-4">Új foglalás</h3>
            <form onSubmit={submitNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Dátum</label>
                <input type="date" required value={newDate}
                  onChange={e => { setNewDate(e.target.value); setNewTime("08:00"); }}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Időpont</label>
                <SlotGrid selected={newTime} occupied={newOccupied} onSelect={setNewTime} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Név *</label>
                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Telefon *</label>
                <input type="tel" required value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">E-mail</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Megjegyzés</label>
                <textarea rows={2} value={newNote} onChange={e => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30 resize-none" />
              </div>
              {newError && <p className="text-xs text-red-600">{newError}</p>}
              <button type="submit" disabled={newLoading}
                className="w-full py-2.5 rounded-xl bg-[#1A4B82] text-white text-sm font-bold hover:bg-[#153d6e] disabled:opacity-60 transition-colors">
                {newLoading ? "Mentés..." : "Foglalás mentése"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit booking modal ───────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 text-[#4C6579] hover:text-[#1A4B82] text-xl font-bold leading-none" aria-label="Bezárás">✕</button>
            <h3 className="text-lg font-bold text-[#1A4B82] mb-4">Foglalás módosítása</h3>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Dátum</label>
                <input type="date" required value={editDate}
                  onChange={e => { setEditDate(e.target.value); setEditTime("08:00"); }}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Időpont</label>
                <SlotGrid selected={editTime} occupied={editOccupied} onSelect={setEditTime} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Név *</label>
                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Telefon *</label>
                <input type="tel" required value={editPhone} onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">E-mail</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4C6579] mb-1">Megjegyzés</label>
                <textarea rows={2} value={editNote} onChange={e => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C3D4E3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4B82]/30 resize-none" />
              </div>
              {editError && <p className="text-xs text-red-600">{editError}</p>}
              <button type="submit" disabled={editLoading}
                className="w-full py-2.5 rounded-xl bg-[#1A4B82] text-white text-sm font-bold hover:bg-[#153d6e] disabled:opacity-60 transition-colors">
                {editLoading ? "Mentés..." : "Változtatások mentése"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
