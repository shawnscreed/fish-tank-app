// 📄 File: src/app/api/tank/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getToken } from 'next-auth/jwt';

// ✅ Admin role check helper
async function isAdmin(req: NextRequest) {
  const token = await getToken({ req });
  const role = token?.role;
  return role === 'admin' || role === 'super_admin';
}

// 📥 GET all active tanks
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM "Tank" WHERE in_use = TRUE ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📥 POST create tank (admin only)
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const fields = ['name', 'water_type', 'gallons', 'in_use'];
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

// 📥 PUT update tank (admin only)
export async function PUT(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, water_type, gallons, in_use } = body;

    const result = await pool.query(
      `UPDATE "Tank"
       SET name = $1, water_type = $2, gallons = $3, in_use = $4
       WHERE id = $5
       RETURNING *;`,
      [name, water_type, gallons, in_use, id]
    );

    return result.rowCount === 0
      ? NextResponse.json({ error: "Not found" }, { status: 404 })
      : NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📥 DELETE soft-delete tank (admin only)
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tank ID required" }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE "Tank" SET in_use = FALSE WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rowCount === 0
      ? NextResponse.json({ error: "Not found" }, { status: 404 })
      : NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
