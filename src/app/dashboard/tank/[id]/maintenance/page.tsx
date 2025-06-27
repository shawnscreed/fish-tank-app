// 📄 app/dashboard/tank/[id]/maintenance/page.tsx
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
  const tankId = Number(id);

  /* ───────── Session Guard ───────── */
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = Number((session.user as any).id);

  /* ───────── Verify Ownership ───────── */
  const { rowCount } = await pool.query(
    `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, userId]
  );

  if (rowCount === 0) {
    console.warn(`❌ Unauthorized access to tank ${tankId} by user ${userId}`);
    redirect("/dashboard");
  }

  /* ───────── Build user object ───────── */
  const user = {
    id: userId,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as any).role as Role,
  };

  /* ───────── Render ───────── */
  return (
    <ClientLayoutWrapper user={user}>
      <TankMaintenancePage userId={userId} tankId={tankId} />
    </ClientLayoutWrapper>
  );
}
