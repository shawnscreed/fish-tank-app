// 📄 File: app/api/tanks/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ MUST be awaited
  const userId = parseInt(_req.nextUrl.searchParams.get("user_id") || "0");

  try {
    const res = await pool.query(
      `SELECT * FROM "Tank" WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Tank not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err) {
    console.error("❌ Tank fetch failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
