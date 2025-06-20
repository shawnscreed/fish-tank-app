// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import WorkTable from "@/components/WorkTable";
import AddTankForm from "@/components/AddTankForm";


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTUser {
  id: number;
  email: string;
  role: "super_admin" | "sub_admin" | "user";
  name?: string;
}

export default async function DashboardPage() {
const cookieStore = await cookies(); // ✅ use await here
const token = cookieStore.get("token")?.value;



  let user: JWTUser | null = null;

  if (!token) {
    redirect("/login"); // 🔐 redirect if no token
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    user = payload as unknown as JWTUser;
  } catch (err) {
    console.error("JWT verification failed", err);
    redirect("/login"); // 🔐 invalid token, redirect
  }
  
console.log("Logged in user ID:", user.id);

  // ✅ Fetch tanks for this user (filter by user_id)
  const tankRes = await pool.query(
    `SELECT id, name, gallons, water_type FROM "Tank" WHERE user_id = $1`,
    [user.id]
  );
  const tanks = tankRes.rows;

  return (
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

<h2 className="text-xl font-semibold mb-2">Your Tanks</h2>
{tanks.length === 0 ? (
  <p>No tanks found.</p>
) : (
  <ul className="list-disc list-inside mb-6">
    {tanks.map((tank: any) => (
      <li key={tank.id}>
        <strong>{tank.name}</strong> – {tank.gallons} gallons –{" "}
        {tank.water_type}
      </li>
    ))}
  </ul>
)}
<AddTankForm userId={user.id} /> {/* ✅ Add this line */}

  {/* ✅ Show Work Entries */}
  <h2 className="text-xl font-semibold mb-2">Your Work Entries</h2>
  <WorkTable userId={user.id} />  {/* <<--- ADD THIS LINE */}
</div>

  );
}
