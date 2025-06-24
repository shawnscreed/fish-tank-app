import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; coralId: string }> } // ✅ CORRECT
) {
  const { id, coralId } = await context.params;

  try {
    await pool.query('DELETE FROM "TankCoral" WHERE id = $1', [coralId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/coral/[coralId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
