// 📄 File: app/api/tanks/[id]/fish/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: fetch fish assigned to this tank
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT f.* FROM "TankFish" tf
       JOIN "Fish" f ON f.id = tf.fish_id
       WHERE tf.tank_id = $1`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned fish:", err);
    return NextResponse.json({ error: "Fish fetch failed" }, { status: 500 });
  }
}

// POST: assign fish to tank
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { fish_id } = await req.json();

  try {
    await pool.query(
      `INSERT INTO "TankFish" (tank_id, fish_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [tankId, fish_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning fish:", err);
    return NextResponse.json({ error: "Fish assignment failed" }, { status: 500 });
  }
}

// DELETE: remove fish from tank
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { fish_id } = await req.json();

  try {
    await pool.query(
      `DELETE FROM "TankFish"
       WHERE tank_id = $1 AND fish_id = $2`,
      [tankId, fish_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing fish:", err);
    return NextResponse.json({ error: "Fish removal failed" }, { status: 500 });
  }
}
