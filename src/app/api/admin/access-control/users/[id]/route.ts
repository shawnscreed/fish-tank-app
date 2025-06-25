import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔐 PUT /api/admin/access-control/users/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    let { paid_level } = body;

    if (typeof paid_level !== "string" || !paid_level.trim()) {
      return NextResponse.json({ error: "Missing or invalid paid_level" }, { status: 400 });
    }

    // 🔠 Normalize capitalization (e.g., "free" -> "Free")
    paid_level = paid_level.charAt(0).toUpperCase() + paid_level.slice(1).toLowerCase();

    const result = await pool.query(
      `UPDATE "User" SET paid_level = $1 WHERE id = $2 RETURNING id, email, paid_level`,
      [paid_level, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ updated: result.rows[0] });
  } catch (err: any) {
    console.error("❌ DB update error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
