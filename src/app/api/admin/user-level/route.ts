import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, level } = await req.json();

  try {
    await pool.query(
      `UPDATE "User" SET paid_level = $1 WHERE id = $2`,
      [level, userId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating user level:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
