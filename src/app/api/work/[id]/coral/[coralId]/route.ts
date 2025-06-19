import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string; coralId: string } }
) {
  const { id, coralId } = context.params;

  try {
    await pool.query(
      'DELETE FROM "TankCoral" WHERE tank_id = $1 AND coral_id = $2',
      [id, coralId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/coral/[coralId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
