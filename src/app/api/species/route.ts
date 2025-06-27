// 📄 File: src/app/api/species/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM (
        SELECT 
          CONCAT('fish-', f.id) AS id,
          f.name AS name,
          'fish' AS type,
          f.ph_low, f.ph_high, f.temp_low, f.temp_high
        FROM "Fish" f
        WHERE f.in_use = TRUE

        UNION ALL

        SELECT 
          CONCAT('plant-', p.id),
          p.name,
          'plant',
          p.ph_low, p.ph_high, p.temp_low, p.temp_high
        FROM "Plant" p
        WHERE p.in_use = TRUE

        UNION ALL

        SELECT 
          CONCAT('invert-', i.id),
          i.name,
          'invert',
          i.ph_low, i.ph_high, i.temp_low, i.temp_high
        FROM "Invert" i
      ) s
      ORDER BY name;
    `);

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("💥 /api/species error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
