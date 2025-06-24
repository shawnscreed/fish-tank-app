import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM "Tank" WHERE in_use = TRUE ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fields = [
      'name', 'water_type', 'gallons', 'in_use'
    ];

    const values = fields.map(field => body[field]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO "Tank" (${fields.join(', ')})
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

