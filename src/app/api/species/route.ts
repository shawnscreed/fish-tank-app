// 📄 File: src/app/api/species/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT CONCAT('fish-', id)  AS id,
             name,
             'fish'              AS type,
             ph_low,
             ph_high,
             temp_low,
             temp_high
      FROM "Fish"
      UNION ALL
      SELECT CONCAT('plant-', id), name, 'plant', ph_low, ph_high, temp_low, temp_high
      FROM "Plant"
      UNION ALL
      SELECT CONCAT('invert-', id), name, 'invert', ph_low, ph_high, temp_low, temp_high
      FROM "Invert"
      ORDER BY name
    `);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/species error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
