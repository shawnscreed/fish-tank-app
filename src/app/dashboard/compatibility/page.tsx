// 📄 File: src/app/dashboard/compatibility/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import pool from "@/lib/db";
import Link from "next/link";

export default async function CompatibilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);
  const user = {
    id: userId,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as any).role,
  };

  // 🔒 Only fetch tanks belonging to the logged-in user
  const { rows: tanks } = await pool.query(
    `SELECT id, name FROM "Tank"
     WHERE user_id = $1 AND in_use = TRUE
     ORDER BY id ASC`,
    [userId]
  );

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-4">Compatibility Checker</h1>
        <p className="text-gray-600 mb-6">
          Pick a tank to view its species compatibility matrix.
        </p>

        {tanks.length === 0 ? (
          <p className="italic text-gray-500">You have no tanks yet.</p>
        ) : (
          <ul className="space-y-2">
            {tanks.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/tank/${t.id}/compatibility`}
                  className="text-blue-600 underline"
                >
                  🧪 {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
