import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/plant
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM "Plant"
      WHERE in_use = TRUE
      ORDER BY name
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /plant error:", err);
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}

// POST /api/plant
export async function POST(req: NextRequest) {
  const data = await req.json();

  try {
    const result = await pool.query(
      `
      INSERT INTO "Plant" (name, light_level, co2_required, temperature_range, in_use)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING *
      `,
      [
        data.name,
        data.light_level,
        data.co2_required ?? false,
        data.temperature_range
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /plant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

