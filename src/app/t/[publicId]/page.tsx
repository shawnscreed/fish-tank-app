// file: src/app/t/[publicId]/page.tsx

import pool from "@/lib/db";
import StockList from "@/components/StockList";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";



export default async function PublicTankPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const { rows } = await pool.query(
    `
    SELECT t.id, t.name,
           json_agg(json_build_object('id', s.id,
                                      'name', s.name,
                                      'type', s.type)) AS stock
    FROM "Tank" t
    LEFT JOIN "TankFish" tf  ON tf.tank_id = t.id
    LEFT JOIN "Fish"     s   ON s.id  = tf.fish_id
    WHERE t.public_id = $1
    GROUP BY t.id
    `,
    [publicId]
  );

  const tank = rows[0];
  if (!tank) return <p>Tank not found.</p>;
  
  /* ───────────── auth check for redirect ───────────── */
  const session = await getServerSession(authOptions);
  if (session?.user) {
    // only redirect if user owns tank or is admin / super_admin
    const ownerCheck = await pool.query(
      'SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2',
      [tank.id, session.user.id]
    );
    const isAdmin =
      session.user.role === "admin" || session.user.role === "super_admin";

    if (ownerCheck.rowCount || isAdmin) {
      redirect(`/dashboard/tank/${tank.id}`);
    }
  }

  /* ───────────── public stock-only view ───────────── */
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {tank.name ?? "My Aquarium"}
      </h1>
      <StockList stock={tank.stock} /> {/* fish / plants / etc. */}
    </main>
  );
}
