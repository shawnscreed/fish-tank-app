// 📄 File: src/app/fish/page.tsx

import { getUserFromServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import FishTableClient from "@/components/FishTableClient";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function FishPage() {
  const user = await getUserFromServer();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/"); // 🔒 Block non-admins
  }

  return (
    <ClientLayoutWrapper user={user}>
      <FishTableClient />
    </ClientLayoutWrapper>
  );
}
