import { getAllBookings } from "@/lib/db";
import AdminClientLoader from "./AdminClientLoader";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const bookings = await getAllBookings();
  return <AdminClientLoader bookings={bookings} />;
}
