// File: src/app/api/tank/[id]/water-tests/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Fetch all water test entries for a specific tank
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const result = await pool.query(
      `SELECT * FROM "TankWaterTest" WHERE tank_id = $1 ORDER BY tested_at DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Add a new water test entry
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await req.json();

  const {
    ph,
    hardness,
    salinity,
    ammonia,
    nitrite,
    nitrate,
    temperature
  } = body;

  try {
    await pool.query(
      `INSERT INTO "TankWaterTest" (tank_id, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
