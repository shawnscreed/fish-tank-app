// 📄 File: app/dashboard/tank/[id]/maintenance/page.tsx

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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.warn("❌ No session found, redirecting to login");
    redirect("/login");
  }

  const userId = Number(session.user.id);
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

  const user = {
    id: userId,
    email: session.user.email || "",
    name: session.user.name || "",
    role: (session.user as any).role as Role,
  };

  return (
    <ClientLayoutWrapper user={user}>
      <TankMaintenancePage userId={userId} tankId={tankId} />
    </ClientLayoutWrapper>
  );
}
