import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { tank_id, coral_id } = await req.json();

    if (!tank_id || !coral_id) {
      return NextResponse.json({ error: "tank_id and coral_id required" }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO "TankCoral" (tank_id, coral_id) VALUES ($1, $2) RETURNING *',
      [tank_id, coral_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("POST /api/tankcoral error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
