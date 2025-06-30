// 📄 File: app/api/tanks/[id]/corals/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ GET: fetch corals assigned to this tank (include assignment_id)
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT tc.id AS assignment_id, c.*
       FROM "TankCoral" tc
       JOIN "Coral" c ON c.id = tc.coral_id
       WHERE tc.tank_id = $1
       ORDER BY c.name`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned corals:", err);
    return NextResponse.json({ error: "Coral fetch failed" }, { status: 500 });
  }
}

// ✅ POST: assign coral to tank
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { coral_id } = await req.json();

  try {
    await pool.query(
      `INSERT INTO "TankCoral" (tank_id, coral_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [tankId, coral_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning coral:", err);
    return NextResponse.json({ error: "Coral assignment failed" }, { status: 500 });
  }
}

// ✅ DELETE: remove coral using assignment_id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { coral_id } = await req.json(); // from POST-style deletion

  // fallback: use `id` as primary key (assignment_id)
  const id = coral_id ?? (await req.json()).id;

  try {
    await pool.query(
      `DELETE FROM "TankCoral" WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing coral:", err);
    return NextResponse.json({ error: "Coral removal failed" }, { status: 500 });
  }
}
