import { getAllBookings } from "@/lib/db";
import AdminClientLoader from "./AdminClientLoader";

export default function AdminPage() {
  const bookings = getAllBookings();
  return <AdminClientLoader bookings={bookings} />;
}
