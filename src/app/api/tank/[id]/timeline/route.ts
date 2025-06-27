// 📄 src/app/api/tank/[id]/timeline/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET /api/tank/[id]/timeline
 * Returns merged events from WaterTest, TankFish, WaterChange, TankChemical
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
    /* ───────────────────────── 1)  Water tests ───────────────────────── */
    const waterTests = await pool.query(
      `
      SELECT
        id,
        'water_test' AS type,
        /* WaterTest definitely has test_date */
        test_date    AS date,
        FORMAT('pH: %s | NH₃: %s | NO₂: %s | NO₃: %s', ph, ammonia, nitrite, nitrate) AS summary
      FROM "WaterTest"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    /* ───────────────────────── 2)  Fish added ───────────────────────── */
    const fish = await pool.query(
      `
      SELECT
        tf.id,
        'fish_added' AS type,
        /* TankFish has created_at per earlier inspection */
        tf.created_at AS date,
        COALESCE(f.name, 'Unknown Fish') || ' added' AS summary
      FROM "TankFish" tf
      LEFT JOIN "Fish" f ON f.id = tf.fish_id
      WHERE tf.tank_id = $1
      `,
      [tankId]
    );

    /* ───────────────────────── 3)  Water changes ─────────────────────── */
    const waterChanges = await pool.query(
      `
      SELECT
        id,
        'water_change' AS type,
        /* prefer changed_at, else fall back to NOW() so query never fails */
        COALESCE(changed_at, NOW()) AS date,
        CASE
          WHEN percentage IS NOT NULL
            THEN percentage::text || '% water change'
          WHEN volume IS NOT NULL
            THEN volume::text     || ' gallons water change'
          ELSE 'Water change'
        END AS summary
      FROM "WaterChange"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    /* ───────────────────────── 4)  Chemical dosing / maintenance ─────── */
    const chemical = await pool.query(
      `
      SELECT
        id,
        'maintenance' AS type,
        /* prefer added_at, else NOW() */
        COALESCE(added_at, NOW()) AS date,
        /* build a readable summary */
        COALESCE(chemical_name, 'Chemical') || ' dose: ' ||
          COALESCE(dosage::text, '?') || COALESCE(unit, '') AS summary
      FROM "TankChemical"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    /* ───────────────────────── Merge & sort ──────────────────────────── */
    const events = [
      ...waterTests.rows,
      ...fish.rows,
      ...waterChanges.rows,
      ...chemical.rows
    ].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Tank timeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
