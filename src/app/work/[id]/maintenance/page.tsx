// 📄 File: src/app/work/[id]/maintenance/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import TankMaintenancePage from "@/components/TankMaintenancePage";
import pool from "@/lib/db";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ FIX: use Promise
}) {
  const { id } = await params; // ✅ FIX: await it

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.warn("❌ No session found, redirecting to login");
    redirect("/login");
  }

  const user = {
    id: Number(session.user.id),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: ((session.user as any).role ?? "user") as Role,
  };

  const userId = user.id;
  const tankId = Number(id);

  // 🛡 Check if tank belongs to the current user
  const tankCheck = await pool.query(
    `SELECT user_id FROM "Tank" WHERE id = $1`,
    [tankId]
  );

  if (!tankCheck.rows.length || tankCheck.rows[0].user_id !== userId) {
    console.warn(`❌ Unauthorized access to tank ${tankId} by user ${userId}`);
    redirect("/dashboard");
  }

  return (
    <ClientLayoutWrapper user={user}>
      <TankMaintenancePage userId={userId} tankId={tankId} />
    </ClientLayoutWrapper>
  );
}
