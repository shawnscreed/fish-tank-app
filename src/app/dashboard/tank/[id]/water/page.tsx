// 📄 File: src/app/dashboard/tank/[id]/water/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import WaterLogPage from "@/components/WaterLogPage";
import pool from "@/lib/db";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function WaterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tankId = Number(id);

  /* ───────── Session Guard ───────── */
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = {
    id: Number((session.user as any).id),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as any).role as Role,
  };

  /* ───────── Verify Tank Ownership ───────── */
  const { rowCount } = await pool.query(
    `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, user.id]
  );

  if (rowCount === 0) {
    console.warn(`❌ Tank ${tankId} not found or not owned by user ${user.id}`);
    redirect("/dashboard");
  }

  /* ───────── Render ───────── */
  return (
    <ClientLayoutWrapper user={user}>
      <WaterLogPage userId={user.id} tankId={tankId} />
    </ClientLayoutWrapper>
  );
}
