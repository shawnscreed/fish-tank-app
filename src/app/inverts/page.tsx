// 📄 File: src/app/inverts/page.tsx

import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromServer } from "@/lib/auth-server";
import InvertsTableClient from "@/components/InvertsTableClient";

export default async function InvertsPage() {
  const user = await getUserFromServer(); // ✅ Correct function

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Admins only
  }

  return (
    <ClientLayoutWrapper user={user}>
      <InvertsTableClient />
    </ClientLayoutWrapper>
  );
}
