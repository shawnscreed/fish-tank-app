// File: src/app/plant/page.tsx
import { redirect } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";
import { getUserFromCookies } from "@/lib/auth-server";
import PlantTableClient from "@/app/plant/PlantTableClient";

export default async function PlantPage() {
  const user = await getUserFromCookies(); // ✅ Fixed typo

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Block non-admins
  }

  return (
    <ClientLayout>
      <PlantTableClient />
    </ClientLayout>
  );
}
