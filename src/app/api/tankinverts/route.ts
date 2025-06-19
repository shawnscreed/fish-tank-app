import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tank_id, invert_id } = body;

    const result = await pool.query(
      `INSERT INTO "TankInvert" (tank_id, invert_id) VALUES ($1, $2) RETURNING *`,
      [tank_id, invert_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/tankinvert error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
