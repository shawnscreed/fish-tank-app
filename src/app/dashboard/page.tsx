// app/dashboard/page.tsx
import { cookies as getCookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import ClientLayout from "@/app/ClientLayout";
import AddTankForm from "@/components/AddTankForm";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTUser {
  id: number;
  email: string;
 role: "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

  name?: string;
}

export default async function DashboardPage() {
const cookieStore = await getCookies();
const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let user: JWTUser | null = null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    user = payload as unknown as JWTUser;
  } catch (err) {
    console.error("JWT verification failed", err);
    redirect("/login");
  }

  const tankRes = await pool.query(
    `SELECT id, name, gallons, water_type FROM "Tank" WHERE user_id = $1`,
    [user.id]
  );
  const tanks = tankRes.rows;

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user.name || user.email}
        </h1>
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

        <AddTankForm userId={user.id} />

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
