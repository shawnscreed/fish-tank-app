// DELETE route: app/api/work/[id]/plant/[plantId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: { plantId: string } }
) {
  const { plantId } = context.params;

  try {
    await pool.query('DELETE FROM "TankPlant" WHERE id = $1', [plantId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/plant/[plantId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}