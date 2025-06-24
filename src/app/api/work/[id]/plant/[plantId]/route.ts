import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// DELETE /api/work/[id]/plant/[plantId]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; plantId: string }> } // ✅ Correct type
) {
  const { id, plantId } = await context.params;

  try {
    await pool.query('DELETE FROM "TankPlant" WHERE id = $1', [parseInt(plantId)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/plant/[plantId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
