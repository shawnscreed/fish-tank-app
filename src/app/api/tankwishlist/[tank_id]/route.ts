import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ tank_id: string }> }
) {
  try {
    const { tank_id } = await context.params;
    const tankId = parseInt(tank_id, 10);
    if (isNaN(tankId)) {
      return NextResponse.json({ error: "Invalid tank_id" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT * FROM "TankWishlist" WHERE tank_id = $1 ORDER BY created_at DESC`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("GET /api/tankwishlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
