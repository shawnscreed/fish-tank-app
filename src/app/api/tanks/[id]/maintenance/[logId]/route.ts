// 📄 File: src/app/api/tanks/[id]/maintenance/[logId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string; logId: string } }
) {
  const tankId = parseInt(context.params.id);
  const logId = parseInt(context.params.logId);
  const data = await req.json();

  try {
    const result = await pool.query(
      `UPDATE "MaintenanceLog"
       SET task = $1, notes = $2
       WHERE id = $3 AND tank_id = $4
       RETURNING *`,
      [data.task, data.notes || null, logId, tankId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Maintenance log not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to update maintenance log:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
