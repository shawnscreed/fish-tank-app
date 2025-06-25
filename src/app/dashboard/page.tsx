// 📄 File: src/app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions"; // ✅ fixed
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import AddTankForm from "@/components/AddTankForm";
import Link from "next/link";
import pool from "@/lib/db"; // ✅ added

type Role = "super_admin" | "sub_admin" | "admin" | "user" | "beta_user";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // ✅ SAFETY CHECK: validate session and ensure user ID is a number
  if (
    !session ||
    !session.user?.id ||
    isNaN(Number(session.user.id))
  ) {
    console.warn("❌ Invalid or missing session.user.id:", session?.user);
    redirect("/login");
  }

  const user = {
    id: Number(session.user.id),
    name: session.user.name || "",
    email: session.user.email || "",
    role: (session.user as any).role as Role,
  };

  const userName = user.name || user.email;

  console.log(`🔍 Loading tanks for user ID: ${user.id}`);

  const tankRes = await pool.query(
    `SELECT id, name, gallons, water_type FROM "Tank" WHERE user_id = $1`,
    [user.id]
  );
  const tanks = tankRes.rows;

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {userName}</h1>
        <p className="text-gray-600 mb-4">
          You are logged in as <strong>{user.role}</strong>.
        </p>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded mb-6"
          >
            Logout
          </button>
        </form>

        <AddTankForm userId={String(user.id)} />

        <h2 className="text-xl font-semibold mt-6 mb-2">Your Tanks</h2>
        {tanks.length === 0 ? (
          <p>No tanks found.</p>
        ) : (
          <ul className="list-disc list-inside space-y-2">
            {tanks.map((tank) => (
              <li key={tank.id}>
                <Link
                  href={`/dashboard/tank/${tank.id}`}
                  className="text-blue-600 underline"
                >
                  {tank.name || "Unnamed Tank"} – {tank.gallons} gallons –{" "}
                  {tank.water_type}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
