// ✅ src/app/api/work/[id]/inverts/[invertsId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string; invertsId: string } }
) {
  // ✅ Await params properly
  const params = await context.params;
  const { invertsId } = params;

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
