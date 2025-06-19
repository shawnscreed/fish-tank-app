import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // This is your DB connection



// ✅ Safely accessing `params` with await
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const result = await pool.query(
      `SELECT * FROM "WaterTest" WHERE tank_id = $1 ORDER BY test_date DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
