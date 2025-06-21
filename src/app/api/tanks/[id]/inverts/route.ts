// 📄 File: app/api/tanks/[id]/inverts/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ GET: fetch all inverts assigned to this tank (including duplicates)
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT ti.id as assignment_id, i.* FROM "TankInvert" ti
       JOIN "Inverts" i ON i.id = ti.invert_id
       WHERE ti.tank_id = $1
       ORDER BY ti.id`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned inverts:", err);
    return NextResponse.json({ error: "Invert fetch failed" }, { status: 500 });
  }
}

// ✅ POST: assign an invert to a tank (allow duplicates)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { invert_id } = await req.json();

  if (typeof invert_id !== "number") {
    return NextResponse.json({ error: "Invalid invert_id" }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO "TankInvert" (tank_id, invert_id)
       VALUES ($1, $2)`,
      [tankId, invert_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning invert:", err);
    return NextResponse.json({ error: "Invert assignment failed" }, { status: 500 });
  }
}

// ✅ DELETE: remove one specific invert assignment from the tank (via assignment_id)
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
      `DELETE FROM "TankInvert"
       WHERE id = $1 AND tank_id = $2`,
      [assignment_id, tankId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing invert:", err);
    return NextResponse.json({ error: "Invert removal failed" }, { status: 500 });
  }
}
