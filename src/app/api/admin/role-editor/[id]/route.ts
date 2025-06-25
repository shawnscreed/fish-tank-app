import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// 🔐 PUT: Update a user's role
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const { role } = await req.json();

  if (!role || typeof role !== "string") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE "User" SET role = $1 WHERE id = $2 RETURNING id, role`,
      [role, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: result.rows[0] });
  } catch (err: any) {
    console.error("Failed to update role:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
