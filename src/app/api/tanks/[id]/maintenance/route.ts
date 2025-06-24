// 📄 File: src/app/api/tanks/[id]/maintenance/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Fetch all maintenance logs for a specific tank
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ CORRECT
) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const result = await pool.query(
      `SELECT * FROM "MaintenanceLog" WHERE tank_id = $1 ORDER BY created_at DESC`,
      [tankId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch maintenance logs:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// POST: Create a new maintenance log for a specific tank
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }

) {
  const { id } = await context.params;

  const tankId = parseInt(id);
  const data = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO "MaintenanceLog" (tank_id, task, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        tankId,
        data.task,
        data.notes || null
      ]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to insert maintenance log:", err);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}
