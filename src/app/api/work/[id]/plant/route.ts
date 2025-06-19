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
      SELECT tp.id AS tank_entry_id, p.id, p.name, p.light_level, p.co2_required, p.temperature_range
      FROM "TankPlant" tp
      JOIN "Plant" p ON tp.plant_id = p.id
      WHERE tp.tank_id = $1
      ORDER BY p.name
      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/plant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
