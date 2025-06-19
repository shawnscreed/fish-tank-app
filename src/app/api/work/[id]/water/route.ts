// File: app/api/work/[id]/water/route.ts - Handles GET and POST for water tests on a tank.

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: List all water tests for a tank by tank_id
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const result = await pool.query(
      `SELECT * FROM "WaterTest" WHERE tank_id = $1 ORDER BY test_date DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/water error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new water test to the tank
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const data = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO "WaterTest" (
        tank_id, ph, hardness, kh, ammonia, nitrite, nitrate,
        salinity, calcium, magnesium, alkalinity, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        id,
        data.ph,
        data.hardness,
        data.kh,
        data.ammonia,
        data.nitrite,
        data.nitrate,
        data.salinity,
        data.calcium,
        data.magnesium,
        data.alkalinity,
        data.notes
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/work/[id]/water error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
