import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/fish/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query('SELECT * FROM "Fish" WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Fish not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/fish/[id]
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = context.params;

  const allowedFields = [
    "name", "water_type", "ph_low", "ph_high",
    "hardness_low", "hardness_high", "temp_low", "temp_high",
    "in_use", "aggressiveness" // ✅ make sure this is included
  ];

  const updates = allowedFields
    .filter(key => key in body)
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(', ');

  const values = allowedFields
    .filter(key => key in body)
    .map(key => body[key]);

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  try {
    await pool.query(
      `UPDATE "Fish" SET ${updates} WHERE id = $${values.length + 1}`,
      [...values, id]
    );

    return NextResponse.json({ message: 'Fish updated' });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
