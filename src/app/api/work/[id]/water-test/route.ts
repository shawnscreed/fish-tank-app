// Routes: app/api/work/[id]/water-tests/route.ts
// This API handles water test logging and retrieval for a specific tank.

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - Fetch all water tests for a tank
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ CORRECT
) {
  const { id } = await context.params;
  try {
    const result = await pool.query(
      `SELECT * FROM "WaterTest" WHERE tank_id = $1 ORDER BY test_date DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Add a new water test result
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ CORRECT
) {
  const { id } = await context.params;
  const {
    test_date,
    ph,
    hardness,
    salinity,
    ammonia,
    nitrite,
    nitrate,
    temperature
  } = await req.json();

  try {
    await pool.query(
      `INSERT INTO "WaterTest" (tank_id, test_date, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, test_date, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/work/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
