// 📄 File: app/api/tanks/[id]/plants/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: fetch plants assigned to this tank
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT p.* FROM "TankPlant" tp
       JOIN "Plant" p ON p.id = tp.plant_id
       WHERE tp.tank_id = $1`,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching assigned plants:", err);
    return NextResponse.json({ error: "Plant fetch failed" }, { status: 500 });
  }
}

// POST: assign plant to tank
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { plant_id } = await req.json();

  try {
    await pool.query(
      `INSERT INTO "TankPlant" (tank_id, plant_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [tankId, plant_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error assigning plant:", err);
    return NextResponse.json({ error: "Plant assignment failed" }, { status: 500 });
  }
}

// DELETE: remove plant from tank
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id);
  const { plant_id } = await req.json();

  try {
    await pool.query(
      `DELETE FROM "TankPlant"
       WHERE tank_id = $1 AND plant_id = $2`,
      [tankId, plant_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error removing plant:", err);
    return NextResponse.json({ error: "Plant removal failed" }, { status: 500 });
  }
}
