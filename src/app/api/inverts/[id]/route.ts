import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/inverts/[id]

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) 

{
  try {
    const result = await pool.query('SELECT * FROM "Inverts" WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Inverts not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/inverts/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const text = await req.text();
  if (!text) {
  return NextResponse.json({ message: "No content to update" }, { status: 200 });
}

  const body = JSON.parse(text);

  const allowedFields = [
    "name", "water_type", "ph_low", "ph_high",
    "hardness_low", "hardness_high", "temp_low", "temp_high",
    "in_use", "aggressiveness"
  ];

  const updates = allowedFields
    .filter((field) => field in body)
    .map((field, index) => `"${field}" = $${index + 1}`);

  const values = allowedFields
    .filter((field) => field in body)
    .map((field) => body[field]);

  try {
    const result = await pool.query(
      `UPDATE "Inverts" SET ${updates.join(", ")} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/inverts/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

