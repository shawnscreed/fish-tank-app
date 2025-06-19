import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string; plantId: string } }
) {
  const { id, plantId } = context.params;

  try {
    await pool.query(
      'DELETE FROM "TankPlant" WHERE tank_id = $1 AND plant_id = $2',
      [id, plantId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/plant/[plantId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
