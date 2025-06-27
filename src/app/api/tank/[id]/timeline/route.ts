// 📄 src/app/api/tank/[id]/timeline/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET /api/tank/[id]/timeline
 * Combines water-tests, fish-added, water-change, and maintenance events.
 * Each row returned as: { id, type, date, summary }
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id }  = await context.params;
  const tankId  = Number(id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ───────────────────────── 1) Water tests
    const waterTests = await pool.query(
      `
      SELECT
        id,
        'water_test' AS type,
        created_at   AS date,
        FORMAT(
          'pH: %s | NH₃: %s | NO₂: %s | NO₃: %s',
          ph, ammonia, nitrite, nitrate
        ) AS summary
      FROM "WaterTest"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    // ───────────────────────── 2) Fish added
    const fish = await pool.query(
      `
      SELECT
        tf.id,
        'fish_added' AS type,
        tf.created_at AS date,
        COALESCE(f.name, 'Unknown Fish') || ' added' AS summary
      FROM "TankFish" tf
      LEFT JOIN "Fish" f ON f.id = tf.fish_id
      WHERE tf.tank_id = $1
      `,
      [tankId]
    );

    // ───────────────────────── 3) Water changes
    const changes = await pool.query(
      `
      SELECT
        id,
        'water_change' AS type,
        created_at     AS date,
        COALESCE(percentage, volume)::text || ' % water change' AS summary
      FROM "WaterChange"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    // ───────────────────────── 4) Maintenance / Work logs
    const work = await pool.query(
      `
      SELECT
        id,
        'maintenance' AS type,
        created_at    AS date,
        COALESCE(description, 'Maintenance performed') AS summary
      FROM "Work"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    // Merge & sort newest → oldest
    const events = [
      ...waterTests.rows,
      ...fish.rows,
      ...changes.rows,
      ...work.rows
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Tank timeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
