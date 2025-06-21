// 📄 File: app/api/tanks/[id]/fish/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ GET: fetch fish assigned to this tank (including assignment_id for unique deletion)
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT tf.id as assignment_id, f.*
       FROM "TankFish" tf
       JOIN "Fish" f ON f.id = tf.fish_id
       WHERE tf.tank_id = $1
       ORDER BY tf.id`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned fish:", err);
    return NextResponse.json({ error: "Fish fetch failed" }, { status: 500 });
  }
}

// ✅ POST: assign fish to tank (allow duplicates)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { fish_id } = await req.json();

  if (typeof fish_id !== "number") {
    return NextResponse.json({ error: "Invalid fish_id" }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO "TankFish" (tank_id, fish_id)
       VALUES ($1, $2)`,
      [tankId, fish_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning fish:", err);
    return NextResponse.json({ error: "Fish assignment failed" }, { status: 500 });
  }
}

// ✅ DELETE: remove one specific fish assignment from the tank using assignment_id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { assignment_id } = await req.json();

  if (typeof assignment_id !== "number") {
    return NextResponse.json({ error: "Invalid assignment_id" }, { status: 400 });
  }

  try {
    await pool.query(
      `DELETE FROM "TankFish"
       WHERE id = $1 AND tank_id = $2`,
      [assignment_id, tankId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing fish:", err);
    return NextResponse.json({ error: "Fish removal failed" }, { status: 500 });
  }
}
