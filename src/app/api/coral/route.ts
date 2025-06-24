import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// ✅ GET: List all corals
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM "Coral" WHERE in_use = TRUE ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST: Create new coral
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
      INSERT INTO "Coral" (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
