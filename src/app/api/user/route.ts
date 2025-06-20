// File: app/api/user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/user — List all users (excluding password_hash)
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM "User" ORDER BY id'
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error('GET /api/user error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/user — Create a new user
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'user' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO "User" (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash, role]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('POST /api/user error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
