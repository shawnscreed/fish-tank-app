// File: src/app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/user/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM "User" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('GET /user/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/user/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const allowedFields = ['name', 'email', 'role'];
  const updates = allowedFields
    .filter(key => key in body)
    .map((key, i) => `"${key}" = $${i + 1}`);
  const values = allowedFields.map(key => body[key]).filter(v => v !== undefined);

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    await pool.query(
      `UPDATE "User" SET ${updates.join(', ')} WHERE id = $${values.length + 1}`,
      [...values, id]
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT /user/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
