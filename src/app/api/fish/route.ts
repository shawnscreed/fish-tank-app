import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/fish - Return only active fish
export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM "Fish" WHERE in_use = TRUE ORDER BY id`);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/fish - Add new fish
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields = [
      'name', 'water_type', 'ph_low', 'ph_high',
      'hardness_low', 'hardness_high', 'temp_low', 'temp_high',
      'aggressiveness', 'in_use'
    ];

    const values = fields.map(field => body[field]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO "Fish" (${fields.join(', ')})
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

// PUT /api/fish/[id] - Update existing fish
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();

    const allowedFields = [
      'name', 'water_type', 'ph_low', 'ph_high',
      'hardness_low', 'hardness_high', 'temp_low', 'temp_high',
      'aggressiveness', 'in_use'
    ];

    const entries = allowedFields
      .filter(key => key in body)
      .map((key, i) => ({
        sql: `"${key}" = $${i + 1}`,
        value: body[key]
      }));

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const updateSQL = entries.map(e => e.sql).join(', ');
    const values = entries.map(e => e.value);

    await pool.query(
      `UPDATE "Fish" SET ${updateSQL} WHERE id = $${values.length + 1}`,
      [...values, id]
    );

    return NextResponse.json({ message: 'Fish updated' });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
