// file: src/app/t/[publicId]/page.tsx
import pool from "@/lib/db";
import StockList from "@/components/StockList";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/* ───────────────────────── page ───────────────────────── */
export default async function PublicTankPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  /* ---------------- get publicId from dynamic route ---------------- */
  const { publicId } = await params;

  /* ---------------- fetch tank + stock list ---------------- */
  const { rows } = await pool.query(
    `
    SELECT t.id,
           t.name,
           json_agg(
             json_build_object(
               'id',   s.id,
               'name', s.name,
               'type', s.kind          -- fish / plant / invert / coral
             )
           ) AS stock
    FROM "Tank" t
    LEFT JOIN (
        /* Fish */
        SELECT tf.tank_id,
               f.id,
               f.name,
               'fish' AS kind
        FROM "TankFish" tf
        JOIN "Fish" f ON f.id = tf.fish_id

        UNION ALL
        /* Plants */
        SELECT tp.tank_id,
               p.id,
               p.name,
               'plant' AS kind
        FROM "TankPlant" tp
        JOIN "Plant" p ON p.id = tp.plant_id

        UNION ALL
        /* Inverts */
        SELECT ti.tank_id,
               i.id,
               i.name,
               'invert' AS kind
        FROM "TankInvert" ti
        JOIN "Invert" i ON i.id = ti.invert_id

        UNION ALL
        /* Corals */
        SELECT tc.tank_id,
               c.id,
               c.name,
               'coral' AS kind
        FROM "TankCoral" tc
        JOIN "Coral" c ON c.id = tc.coral_id
    ) s ON s.tank_id = t.id
    WHERE t.public_id = $1
    GROUP BY t.id;
    `,
    [publicId]
  );

  const tank = rows[0];
  if (!tank) return <p>Tank not found.</p>;

  /* ---------------- auth check: owner or admin → redirect ---------------- */
  const session = await getServerSession(authOptions);
  if (session?.user) {
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

  /* ---------------- public stock-only view ---------------- */
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {tank.name ?? "My Aquarium"}
      </h1>

      {/* List fish / plants / inverts / corals */}
      <StockList stock={tank.stock} />
    </main>
  );
}
