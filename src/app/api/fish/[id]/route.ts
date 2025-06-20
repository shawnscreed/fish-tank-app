import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/fish/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const result = await pool.query('SELECT * FROM "Fish" WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Fish not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ SOFT DELETE /api/fish/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const result = await pool.query(
      `UPDATE "Fish" SET in_use = FALSE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Fish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/fish/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/fish/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Missing or invalid JSON body" }, { status: 400 });
  }

  const allowedFields = [
    "name", "water_type", "ph_low", "ph_high",
    "hardness_low", "hardness_high", "temp_low", "temp_high", "aggressiveness"
  ];

  const entries = allowedFields
    .filter(key => key in body)
    .map(key => ({ key, value: body[key as keyof typeof body] }));

  if (entries.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updates = entries.map((e, i) => `"${e.key}" = $${i + 1}`);
  const values = entries.map(e => e.value);

  try {
    await pool.query(
      `UPDATE "Fish" SET ${updates.join(", ")} WHERE id = $${values.length + 1}`,
      [...values, id]
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /fish/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
