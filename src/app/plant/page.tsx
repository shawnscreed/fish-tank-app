// 📄 File: src/app/plant/page.tsx

import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromServer } from "@/lib/auth-server";
import PlantTableClient from "@/components/PlantTableClient";

export default async function PlantPage() {
  const user = await getUserFromServer(); // ✅ Updated function name

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Admins only
  }

  return (
    <ClientLayoutWrapper user={user}>
      <PlantTableClient />
    </ClientLayoutWrapper>
  );
}
