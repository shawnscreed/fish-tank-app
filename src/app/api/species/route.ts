// 📄 File: src/app/api/species/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows: fish } = await pool.query(`
      SELECT CONCAT('fish-', id) AS id, name, 'fish' AS type, ph_low, ph_high, temp_low, temp_high
      FROM "Fish"
    `);
    const { rows: plants } = await pool.query(`
      SELECT CONCAT('plant-', id) AS id, name, 'plant' AS type, ph_low, ph_high, temp_low, temp_high
      FROM "Plant"
    `);
    const { rows: inverts } = await pool.query(`
      SELECT CONCAT('invert-', id) AS id, name, 'invert' AS type, ph_low, ph_high, temp_low, temp_high
      FROM "Invert"
    `);

    return NextResponse.json([...fish, ...plants, ...inverts]);
  } catch (err: any) {
    console.error("GET /api/species error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
