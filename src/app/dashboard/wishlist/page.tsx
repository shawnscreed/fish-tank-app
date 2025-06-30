// src/app/dashboard/wishlist/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import Link from "next/link";
import type { Role } from "@/lib/auth";

export default async function WishlistDashboardPage() {
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
    `SELECT id, name, gallons, water_type FROM "Tank" WHERE user_id = $1 ORDER BY id`,
    [user.id]
  );

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <h1 className="text-3xl font-bold mb-6">Your Tanks & Wishlists</h1>
        {tanks.length === 0 ? (
          <p>You don’t have any tanks yet. Add some first!</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tanks.map((tank) => (
              <li key={tank.id} className="rounded border p-4 shadow-sm">
                <h2 className="text-xl font-semibold">{tank.name || "Unnamed Tank"}</h2>
                <p className="text-gray-600">
                  {tank.gallons} gallons • {tank.water_type}
                </p>
                <Link
                  href={`/dashboard/tank/${tank.id}/wishlist`}
                  className="inline-block mt-4 text-blue-600 hover:underline"
                >
                  View Wishlist
                </Link>
              </li>
            ))}
          </ul>
        )}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
