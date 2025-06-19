import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

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
    console.error("POST /api/tankplant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
