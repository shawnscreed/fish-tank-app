// 📄 File: src/app/plant/page.tsx
export const dynamic = "force-dynamic"; // ⛔ prevents SSG and fixes getToken() error

import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromServer } from "@/lib/auth-server";
import PlantTableClient from "@/components/PlantTableClient";

export default async function PlantPage() {
  const user = await getUserFromServer();


  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Admins only
  }

  return (
    <ClientLayoutWrapper user={user}>
      <PlantTableClient />
    </ClientLayoutWrapper>
  );
}
