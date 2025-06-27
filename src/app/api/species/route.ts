// 📄 src/app/api/species/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM (
        SELECT CONCAT('fish-', id)  AS id,  name, 'fish'  AS type,
               ph_low,  ph_high,  temp_low,  temp_high
        FROM "Fish"

        UNION ALL
        SELECT CONCAT('plant-', id) AS id,  name, 'plant' AS type,
               ph_low,  ph_high,  NULL      AS temp_low,  NULL      AS temp_high
        FROM "Plant"

        UNION ALL
        SELECT CONCAT('invert-', id) AS id, name, 'invert' AS type,
               ph_low,  ph_high,  NULL      AS temp_low,  NULL      AS temp_high
        FROM "Invert"
      ) s
      ORDER BY name;
    `);

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("💥 /api/species error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
