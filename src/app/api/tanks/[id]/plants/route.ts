// 📄 File: app/api/tanks/[id]/plants/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ GET: fetch assigned plants with assignment_id
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT tp.id as assignment_id, p.*
       FROM "TankPlant" tp
       JOIN "Plant" p ON p.id = tp.plant_id
       WHERE tp.tank_id = $1
       ORDER BY tp.id`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned plants:", err);
    return NextResponse.json({ error: "Plant fetch failed" }, { status: 500 });
  }
}

// ✅ POST: assign plant to tank (allow duplicates)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { plant_id } = await req.json();

  if (typeof plant_id !== "number") {
    return NextResponse.json({ error: "Invalid plant_id" }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO "TankPlant" (tank_id, plant_id)
       VALUES ($1, $2)`,
      [tankId, plant_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning plant:", err);
    return NextResponse.json({ error: "Plant assignment failed" }, { status: 500 });
  }
}

// ✅ DELETE: remove one specific plant assignment using assignment_id
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
      `DELETE FROM "TankPlant"
       WHERE id = $1 AND tank_id = $2`,
      [assignment_id, tankId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing plant:", err);
    return NextResponse.json({ error: "Plant removal failed" }, { status: 500 });
  }
}
