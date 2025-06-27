// 📄 src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import AddTankForm from "@/components/AddTankForm";
import Link from "next/link";
import pool from "@/lib/db";

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

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

  const { rows: tanks } = await pool.query(
    `SELECT id, name, gallons, water_type
       FROM "Tank"
      WHERE user_id = $1
      ORDER BY id`,
    [user.id]
  );

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user.name || user.email}
        </h1>
        <p className="text-gray-600 mb-4">
          You are logged in as <strong>{user.role}</strong>.
        </p>

        <form action="/api/logout" method="POST">
          <button className="bg-red-600 text-white px-4 py-2 rounded mb-6">
            Logout
          </button>
        </form>

        <AddTankForm userId={String(user.id)} />

        <h2 className="text-xl font-semibold mt-6 mb-2">Your Tanks</h2>
        {tanks.length === 0 ? (
          <p>No tanks found.</p>
        ) : (
          <ul className="list-disc list-inside space-y-2">
            {tanks.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/tank/${t.id}`}
                  className="text-blue-600 underline"
                >
                  {t.name || "Unnamed Tank"} – {t.gallons} gallons – {t.water_type}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
