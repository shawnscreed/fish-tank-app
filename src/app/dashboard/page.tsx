// 📄 File: src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";
import AddTankForm from "@/components/AddTankForm";
import pool from "@/lib/db";
import Link from "next/link";
import { JWTUser } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    console.warn("❌ No valid session or missing user ID");
    redirect("/login");
  }

  const userId = Number(session.user.id); // Ensure it's a number
  const userName = session.user.name || session.user.email;
  const userRole = (session.user as any).role;

  if (!userRole) {
    console.error("❌ Session missing user role:", session.user);
    redirect("/login");
  }

  const user: JWTUser = {
    id: userId,
    email: session.user.email || "",
    name: session.user.name || "",
    role: userRole,
  };

  // Load tanks for this user
  const tankRes = await pool.query(
    `SELECT id, name, gallons, water_type FROM "Tank" WHERE user_id = $1`,
    [userId]
  );
  const tanks = tankRes.rows;

  return (
    <ClientLayout user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {userName}</h1>
        <p className="text-gray-600 mb-4">
          You are logged in as <strong>{userRole}</strong>.
        </p>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded mb-6"
          >
            Logout
          </button>
        </form>

       <AddTankForm userId={String(userId)} />


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
    </ClientLayout>
  );
}
