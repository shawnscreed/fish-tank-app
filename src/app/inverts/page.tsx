// File: src/app/inverts/page.tsx
import { redirect } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";
import { getUserFromCookies } from "@/lib/auth-server";
import InvertsTableClient from "./InvertsTableClient"; // ✅ Ensure full filename

export default async function InvertsPage() {
  const user = await getUserFromCookies(); // ✅ Correct function

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Admins only
  }

  return (
    <ClientLayout>
      <InvertsTableClient />
    </ClientLayout>
  );
}
