// 📄 File: src/app/api/tankinverts/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ POST - Assign an invert to a tank
export async function POST(req: NextRequest) {
  try {
    const { tank_id, invert_id } = await req.json();

    if (!tank_id || !invert_id) {
      return NextResponse.json(
        { error: "tank_id and invert_id required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO "TankInvert" (tank_id, invert_id) VALUES ($1, $2) RETURNING *`,
      [tank_id, invert_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/tankinverts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove an invert assignment by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM "TankInvert" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/tankinverts error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
