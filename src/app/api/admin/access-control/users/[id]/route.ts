import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 🔐 PUT /api/admin/access-control/users/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { paid_level } = await req.json();

  if (!paid_level) {
    return NextResponse.json({ error: "Missing paid_level" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE "User" SET paid_level = $1 WHERE id = $2 RETURNING id, email, paid_level`,
      [paid_level, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ updated: result.rows[0] });
  } catch (err: any) {
    console.error("DB update error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
