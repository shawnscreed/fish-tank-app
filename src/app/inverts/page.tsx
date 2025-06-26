// 📄 File: src/app/inverts/page.tsx

export const dynamic = "force-dynamic"; // ⛔ prevents SSG and fixes getToken() error

import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromServer } from "@/lib/auth-server";
import InvertsTableClient from "@/components/InvertsTableClient";

export default async function InvertsPage() {
  const user = await getUserFromServer();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    redirect("/");
  }

  return (
    <ClientLayoutWrapper user={user}>
      <InvertsTableClient />
    </ClientLayoutWrapper>
  );
}
