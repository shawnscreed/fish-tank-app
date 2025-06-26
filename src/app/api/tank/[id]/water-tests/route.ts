import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/tank/[id]/water-tests
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const result = await pool.query(
      `SELECT * FROM "TankWaterTest" WHERE tank_id = $1 ORDER BY test_date DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/tank/[id]/water-tests
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
    const insert = await pool.query(
      `INSERT INTO "TankWaterTest" 
         (tank_id, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature]
    );

    return NextResponse.json(insert.rows[0]);
  } catch (err: any) {
    console.error("POST /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
