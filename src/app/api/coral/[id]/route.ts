import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/coral/[id]

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) 

{
  try {
    const result = await pool.query('SELECT * FROM "Coral" WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Coral not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/coral/[id]
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = context.params;

  const allowedFields = [
    "name", "water_type", "ph_low", "ph_high",
    "hardness_low", "hardness_high", "temp_low", "temp_high",
    "in_use", "aggressiveness"
  ];

  // Only include fields that were sent in the request
  const updates = Object.keys(body)
    .filter(key => allowedFields.includes(key))
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(', ');

  const values = Object.keys(body)
    .filter(key => allowedFields.includes(key))
    .map(key => body[key]);

  if (!updates) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE "Coral" SET ${updates} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
