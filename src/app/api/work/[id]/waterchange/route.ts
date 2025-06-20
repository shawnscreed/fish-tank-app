// File: app/api/work/[id]/waterchange/route.ts
// Handles GET and POST routes for water change logs per tank

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Fetch all water change records for a specific tank
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ Await required

  try {
    const result = await pool.query(
      `SELECT * FROM "WaterChange" WHERE tank_id = $1 ORDER BY change_date DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/waterchange error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new water change log for a tank
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ Await required
  const data = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO "WaterChange" (tank_id, percent_changed, notes)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, data.percent_changed, data.notes]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/work/[id]/waterchange error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
