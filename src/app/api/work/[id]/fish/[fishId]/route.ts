import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; fishId: string }> } // ✅ CORRECT
) {
  const { id, fishId } = await context.params;


  try {
    await pool.query(
  'DELETE FROM "TankFish" WHERE id = $1',
  [fishId] // Here, fishId is really tank_entry_id
);


    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/fish/[fishId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
