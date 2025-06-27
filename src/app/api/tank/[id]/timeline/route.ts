// 📄 src/app/api/tank/[id]/timeline/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET /api/tank/[id]/timeline
 * Combines water-tests (from "WaterTest") and fish-added events.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = Number(id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ───────────────────────────
    // 1)  Water tests  (from "WaterTest")
    // ───────────────────────────
    const water = await pool.query(
      `
      SELECT
        id,
        'water_test'          AS type,
        created_at            AS date,
        FORMAT('pH: %s | NH₃: %s | NO₂: %s | NO₃: %s',
               ph, ammonia, nitrite, nitrate) AS summary
      FROM "WaterTest"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    // ───────────────────────────
    // 2)  Fish added             (still works, fallback for missing column)
    // ───────────────────────────
    const fish = await pool.query(
      `
      SELECT
        tf.id,
        'fish_added'          AS type,
        tf.created_at         AS date,
        COALESCE(f.common_name, f.name, 'Unknown Fish') ||
          ' (qty ' || COALESCE(tf.quantity, 1) || ') added'  AS summary
      FROM "TankFish"  tf
      LEFT JOIN "Fish" f ON f.id = tf.fish_id
      WHERE tf.tank_id = $1
      `,
      [tankId]
    );

    // Merge & sort newest→oldest
    const events = [...water.rows, ...fish.rows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Tank timeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
