import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/plant
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM "Plant" ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/plant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fields = ['name', 'light_level', 'co2_required', 'temperature_range'];
    const values = fields.map(field => body[field]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO "Plant" (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/plant/:id
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { id } = context.params;

    const allowedFields = ['name', 'light_level', 'co2_required', 'temperature_range'];

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

    const result = await pool.query(query, [...values, id]);
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
