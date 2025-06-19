import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string; invertsId: string } }
) {
  const { id, invertsId } = context.params;

  try {
    await pool.query(
      'DELETE FROM "TankInverts" WHERE tank_id = $1 AND inverts_id = $2',
      [id, invertsId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/inverts/[invertsId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
