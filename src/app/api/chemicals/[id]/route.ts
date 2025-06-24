// ✅ File: app/api/chemicals/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
    console.error("PUT /api/chemicals/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
