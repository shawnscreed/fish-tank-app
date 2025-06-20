// 📄 File: app/api/tanks/[id]/inverts/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: fetch inverts assigned to this tank
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT i.* FROM "TankInvert" ti
       JOIN "Invert" i ON i.id = ti.invert_id
       WHERE ti.tank_id = $1`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned inverts:", err);
    return NextResponse.json({ error: "Invert fetch failed" }, { status: 500 });
  }
}

// POST: assign invert to tank
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { invert_id } = await req.json();

  try {
    await pool.query(
      `INSERT INTO "TankInvert" (tank_id, invert_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [tankId, invert_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning invert:", err);
    return NextResponse.json({ error: "Invert assignment failed" }, { status: 500 });
  }
}

// DELETE: remove invert from tank
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { invert_id } = await req.json();

  try {
    await pool.query(
      `DELETE FROM "TankInvert"
       WHERE tank_id = $1 AND invert_id = $2`,
      [tankId, invert_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing invert:", err);
    return NextResponse.json({ error: "Invert removal failed" }, { status: 500 });
  }
}
