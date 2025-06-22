// 📄 /src/app/api/tanks/[id]/water/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const data = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO "WaterTest" (tank_id, ph, hardness, ammonia, nitrite, nitrate, salinity, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        tankId,
        data.ph,
        data.hardness,
        data.ammonia,
        data.nitrite,
        data.nitrate,
        data.salinity,
        data.notes,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to insert water test:", err);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT * FROM "WaterTest" WHERE tank_id = $1 ORDER BY created_at DESC`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch water tests:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
