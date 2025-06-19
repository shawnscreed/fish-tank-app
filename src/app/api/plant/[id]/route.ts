import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/plants/[id]

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) 

{
  try {
    const result = await pool.query('SELECT * FROM "Plants" WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Plants not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/plants/[id]
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = await context.params; // ✅ Fix here

  const allowedFields = [
    "name", "light_level", "co2_required", "temperature_range"
  ];

  const updates = allowedFields
    .filter(key => key in body)
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(', ');

  const values = allowedFields
    .filter(key => key in body)
    .map(key => body[key]);

  if (!updates) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const query = `
    UPDATE "Plant"
    SET ${updates}
    WHERE id = $${values.length + 1}
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [...values, id]);
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

