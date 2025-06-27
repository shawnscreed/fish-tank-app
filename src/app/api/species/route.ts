import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // only fish, numeric id
    const { rows } = await pool.query(`
      SELECT id,
             name,
             'fish' AS type,
             ph_low,
             ph_high,
             temp_low,
             temp_high
      FROM "Fish"
      ORDER BY name
    `);

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/species error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
