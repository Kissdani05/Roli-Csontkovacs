"use client";

import dynamic from "next/dynamic";
import type { Booking } from "@/lib/db";

// Disable SSR for AdminClient to prevent hydration mismatches
// caused by Date/timezone differences between server and browser.
const AdminClient = dynamic(() => import("./AdminClient"), { ssr: false });

export default function AdminClientLoader({ bookings }: { bookings: Booking[] }) {
  return <AdminClient bookings={bookings} />;
}
