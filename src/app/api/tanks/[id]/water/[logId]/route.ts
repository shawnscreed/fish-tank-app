import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string; logId: string } }
) {
  const { id, logId } = await context.params;
  const data = await req.json();

  try {
    const result = await pool.query(
      `UPDATE "WaterTest"
       SET ph = $1,
           hardness = $2,
           ammonia = $3,
           nitrite = $4,
           nitrate = $5,
           salinity = $6,
           notes = $7
       WHERE id = $8 AND tank_id = $9
       RETURNING *`,
      [
        data.ph,
        data.hardness,
        data.ammonia,
        data.nitrite,
        data.nitrate,
        data.salinity,
        data.notes,
        parseInt(logId),
        parseInt(id)
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to update water log:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
