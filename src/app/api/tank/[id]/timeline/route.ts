// 📄 src/app/api/tank/[id]/timeline/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

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

  const userId = Number((session.user as any).id);

  // 🚫 Ownership check
  const { rowCount } = await pool.query(
    `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, userId]
  );

  if (rowCount === 0) {
    console.warn(`❌ User ${userId} tried to access timeline of tank ${tankId}`);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    /* ───── 1) Water-tests ───── */
    const waterTests = await pool.query(
      `
      SELECT
        id,
        'water_test' AS type,
        test_date    AS date,
        FORMAT(
          'pH: %s | NH₃: %s | NO₂: %s | NO₃: %s',
          ph, ammonia, nitrite, nitrate
        ) AS summary
      FROM "WaterTest"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    /* ───── 2) Fish added ───── */
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

    /* ───── 3) Water changes ───── */
    const waterChanges = await pool.query(
      `
      SELECT
        id,
        'water_change' AS type,
        change_date    AS date,
        COALESCE(percent_changed::text, '?') ||
          '% water change' ||
          CASE
            WHEN notes IS NOT NULL AND notes <> '' THEN ' – ' || notes
            ELSE ''
          END AS summary
      FROM "WaterChange"
      WHERE tank_id = $1
      `,
      [tankId]
    );

    /* ───── 4) Chemical dosing / maintenance ───── */
    const maintenance = await pool.query(
      `
      SELECT
        tc.id,
        'maintenance'      AS type,
        tc.added_at        AS date,
        COALESCE(c.name, 'Chemical') ||
          ' dose: ' ||
          COALESCE(tc.amount, '?') ||
          CASE
            WHEN tc.notes IS NOT NULL AND tc.notes <> '' THEN ' – ' || tc.notes
            ELSE ''
          END AS summary
      FROM "TankChemical" tc
      JOIN "Work" w          ON w.id       = tc.work_id
      LEFT JOIN "Chemical" c ON c.id       = tc.chemical_id
      WHERE w.tank_id = $1
      `,
      [tankId]
    );

    // 🧩 Combine and sort all events
    const events = [
      ...waterTests.rows,
      ...fish.rows,
      ...waterChanges.rows,
      ...maintenance.rows
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Tank timeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
