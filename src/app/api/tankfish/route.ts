// 📄 File: src/app/api/tankfish/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ✅ POST - Assign fish to a tank
export async function POST(req: NextRequest) {
  try {
    const { tank_id, fish_id } = await req.json();

    if (!tank_id || !fish_id) {
      return NextResponse.json(
        { error: "tank_id and fish_id required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO "TankFish" (tank_id, fish_id) VALUES ($1, $2) RETURNING *`,
      [tank_id, fish_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("POST /api/tankfish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove a fish assignment by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await pool.query(
      `DELETE FROM "TankFish" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/tankfish error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
