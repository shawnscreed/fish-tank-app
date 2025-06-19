import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    const result = await pool.query(
      `
      SELECT tf.id AS tank_entry_id, f.id AS fish_id,
       f.name, f.ph_low, f.ph_high, f.hardness_low, f.hardness_high,
       f.temp_low, f.temp_high, f.aggressiveness
FROM "TankFish" tf
JOIN "Fish" f ON tf.fish_id = f.id
WHERE tf.tank_id = $1
ORDER BY f.name

      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/fish error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
