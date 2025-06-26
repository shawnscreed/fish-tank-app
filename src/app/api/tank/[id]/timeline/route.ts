import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET /api/tank/[id]/timeline
 * Combines water-tests and fish-added events (phase-1).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = Number(id);

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1) Water-tests
    const water = await pool.query(
      `
      SELECT
        id,
        'water_test'  AS type,
        created_at    AS date,
        FORMAT('pH: %s | NH₃: %s | NO₂: %s | NO₃: %s',
               ph, ammonia, nitrite, nitrate) AS summary
      FROM "TankWaterTest"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    // 2) Fish added
    const fish = await pool.query(
      `
      SELECT
        tf.id,
        'fish_added' AS type,
        tf.created_at AS date,
        CONCAT(f."common_name", ' (qty ',
               COALESCE(tf.quantity, 1), ') added') AS summary
      FROM "TankFish" tf
      JOIN "Fish" f ON f.id = tf.fish_id
      WHERE tf.tank_id = $1
      `,
      [tankId]
    );

    // Merge & sort DESC by date
    const events = [...water.rows, ...fish.rows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Tank timeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
