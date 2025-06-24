// ✅ src/app/api/work/[id]/inverts/[invertsId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; invertsId: string }> }
) {
  const { id, invertsId } = await context.params;

  // ✅ Safety check: make sure ID is a valid integer
  const parsedId = parseInt(invertsId);
  if (isNaN(parsedId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await pool.query('DELETE FROM "TankInvert" WHERE id = $1', [parsedId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/[id]/inverts/[invertsId] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
