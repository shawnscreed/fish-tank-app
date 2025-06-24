import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ CORRECT
) {
  const { id } = await context.params;

  try {
    const result = await pool.query(
      `
      SELECT c.id, c.name, c.ph_low, c.ph_high, c.hardness_low, c.hardness_high,
             c.temp_low, c.temp_high, c.aggressiveness
      FROM "TankCoral" tc
      JOIN "Coral" c ON tc.coral_id = c.id
      WHERE tc.tank_id = $1
      ORDER BY c.name
      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/coral error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
