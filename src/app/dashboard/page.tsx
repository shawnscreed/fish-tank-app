import MainContainer from "@/components/MainContainer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import AddTankForm from "@/components/AddTankForm";
import TankCardClient from "@/components/TankCardClient";   // ➡️ new
import pool from "@/lib/db";
import type { Role } from "@/lib/auth";                     // (reuse Role type)

// ───────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || Number.isNaN(Number(session.user.id))) {
    redirect("/login");
  }

  const user = {
    id: Number(session.user.id),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as any).role as Role,
  };

  // 🐠 Fetch tanks (now also selecting public_id)
  const { rows: tanks } = await pool.query(
    `SELECT id, name, gallons, water_type, public_id
     FROM "Tank"
     WHERE user_id = $1
     ORDER BY id`,
    [user.id]
  );

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold">
                {user.name || user.email}
              </span>
              <span className="ml-1 italic text-gray-500">
                ({user.role})
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <AddTankForm userId={String(user.id)} />
            <form action="/api/logout" method="POST">
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* ── Tanks Grid ── */}
        {tanks.length === 0 ? (
          <p className="text-gray-500">
            You don’t have any tanks yet – use “Add Tank” above to create one.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tanks.map((t) => (
              <TankCardClient key={t.id} tank={t} />
            ))}
          </ul>
        )}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
