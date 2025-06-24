import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/tank/[id]

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) 

{
  try {
    const result = await pool.query('SELECT * FROM "Tank" WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Tank not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tank/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  

  const allowedFields = [
    'name', 'water_type', 'gallons', 'in_use'
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
      `UPDATE "Tank" SET ${updates} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
