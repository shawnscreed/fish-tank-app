// 📄 File: src/app/api/tankplants/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ POST - Assign plant to tank
export async function POST(req: NextRequest) {
  try {
    const { tank_id, plant_id } = await req.json();

    if (!tank_id || !plant_id) {
      return NextResponse.json({ error: "Missing tank_id or plant_id" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO "TankPlant" (tank_id, plant_id) VALUES ($1, $2) RETURNING *`,
      [tank_id, plant_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/tankplants error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove plant assignment by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM "TankPlant" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/tankplants error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
