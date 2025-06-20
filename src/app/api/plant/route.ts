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

// PUT /api/plant/:id
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.warn("Empty or invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
  }

  const allowedFields = [
    "name", "light_level", "co2_required", "temperature_range", "in_use"
  ];

  const updates = allowedFields
    .filter(field => field in body)
    .map((field, i) => `"${field}" = $${i + 1}`);

  const values = allowedFields
    .filter(field => field in body)
    .map(field => body[field]);

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 200 });
  }

  try {
    await pool.query(
      `UPDATE "Plant" SET ${updates.join(", ")} WHERE id = $${updates.length + 1}`,
      [...values, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /plant/[id] error:", err);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}
