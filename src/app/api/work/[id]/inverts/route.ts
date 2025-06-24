// src/app/api/work/[id]/inverts/route.ts
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
      SELECT ti.id AS tank_entry_id, i.id, i.name, i.ph_low, i.ph_high,
             i.hardness_low, i.hardness_high, i.temp_low, i.temp_high, i.aggressiveness
      FROM "TankInvert" ti
      JOIN "Inverts" i ON ti.invert_id = i.id
      WHERE ti.tank_id = $1
      ORDER BY i.name
      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/inverts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
