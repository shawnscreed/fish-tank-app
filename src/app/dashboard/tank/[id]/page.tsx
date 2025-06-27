// 📄 File: src/app/dashboard/tank/[id]/page.tsx
import MainContainer from "@/components/MainContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import TankDetail from "@/components/TankDetail";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import TankReminderAlert from "@/components/TankReminderAlert";
import pool from "@/lib/db";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function TankDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tankId = Number(id);

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.warn("❌ No session found, redirecting to login");
    redirect("/login");
  }

  const user = {
    id: Number((session.user as any).id),
    name: session.user.name || "",
    email: session.user.email || "",
    role: (session.user as any).role as Role,
  };

  // ✅ Check DB to ensure this tank belongs to the user
  const result = await pool.query(
    `SELECT * FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, user.id]
  );

  if (result.rowCount === 0) {
    console.warn(`❌ Tank ${tankId} not found or not owned by user ${user.id}`);
    redirect("/dashboard");
  }

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <TankReminderAlert tankId={tankId} />

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <a
            href={`/dashboard/tank/${tankId}/reminders`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
          >
            🛠 View Maintenance Reminders
          </a>
          <a
            href={`/dashboard/tank/${tankId}/timeline`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
          >
            📅 View Tank Timeline
          </a>
        </div>

        <TankDetail userId={user.id} tankId={tankId} />
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
