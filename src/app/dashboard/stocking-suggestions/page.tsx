// src/app/dashboard/stocking-suggestions/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import pool from "@/lib/db";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import type { JWTUser, Role } from "@/lib/auth";

interface Tank {
  id: number;
  name: string | null;
}

export default async function StockingSuggestionsIndexPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user: JWTUser = {
    id: Number(session.user.id),
    email: session.user.email ?? "",
    role: (session.user.role ?? "user") as Role,
    name: session.user.name ?? undefined,
  };

  // Fetch tanks for this user
  const { rows: tanks } = await pool.query<Tank>(
    `SELECT id, name FROM "Tank" WHERE user_id = $1 ORDER BY id`,
    [user.id]
  );

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-6">Select a Tank for Stocking Suggestions</h1>

        {tanks.length === 0 ? (
          <p>You don’t have any tanks yet. Please add one first.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2 max-w-md">
            {tanks.map((tank) => (
              <li key={tank.id}>
                <a
                  href={`/dashboard/tank/${tank.id}/stocking-suggestions`}
                  className="text-blue-600 hover:underline"
                >
                  {tank.name || `Tank #${tank.id}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
