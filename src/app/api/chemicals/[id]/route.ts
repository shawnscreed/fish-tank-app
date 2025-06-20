// File: app/api/chemicals/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // ✅ await required

  try {
    const result = await pool.query(
      `UPDATE "Chemical" SET in_use = FALSE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/chemicals/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

