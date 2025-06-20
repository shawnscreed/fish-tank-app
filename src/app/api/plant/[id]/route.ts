import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/plants/[id]

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) 

{
  try {
    const result = await pool.query('SELECT * FROM "Plants" WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Plants not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// In your DELETE /api/plant/[id]/route.ts
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await pool.query(
      `UPDATE "Plant" SET in_use = FALSE WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /plant/[id] error:", err);
    return NextResponse.json({ error: "Failed to soft delete plant" }, { status: 500 });
  }
}



// PUT /api/plants/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body = {};
  try {
    // Try parsing the JSON body, but catch empty body case
    body = await req.json();
  } catch (err) {
    console.warn("No JSON body provided, skipping parsing.");
  }

  const allowedFields = [
    "name", "light_level", "co2_required", "temperature_range", "in_use"
  ];

  const updates = Object.entries(body)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key, value]) => ({ key, value }));

  if (updates.length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided for update" },
      { status: 400 }
    );
  }

  const setClause = updates.map((u, i) => `"${u.key}" = $${i + 1}`).join(", ");
  const values = updates.map((u) => u.value);

  try {
    await pool.query(
      `UPDATE "Plant" SET ${setClause} WHERE id = $${values.length + 1}`,
      [...values, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /plant/[id] error:", err);
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 });
  }
}


