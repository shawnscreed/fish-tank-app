import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// ✅ PUT: Rename a level
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ level: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { level } = await context.params;
  const oldLevel = decodeURIComponent(level);

  const { new_level } = await req.json();
  const newLevel = typeof new_level === "string" ? new_level.trim() : "";

  if (!newLevel) {
    return NextResponse.json({ error: "New level name is required" }, { status: 400 });
  }

  try {
    await Promise.all([
      pool.query(
        `UPDATE "MembershipLevel" SET name = $1 WHERE name = $2`,
        [newLevel, oldLevel]
      ),
      pool.query(
        `UPDATE "User" SET paid_level = $1 WHERE paid_level = $2`,
        [newLevel, oldLevel]
      ),
      pool.query(
        `UPDATE "PageAccessControl"
         SET required_levels = array_replace(required_levels, $2, $1)
         WHERE $2 = ANY(required_levels)`,
        [newLevel, oldLevel]
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Rename level failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove a level
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ level: string }> }
) {
  const user = await getUserFromRequest(_req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { level } = await context.params;
  const decodedLevel = decodeURIComponent(level);

  try {
    await Promise.all([
      pool.query(
        `UPDATE "PageAccessControl"
         SET required_levels = array_remove(required_levels, $1)
         WHERE $1 = ANY(required_levels)`,
        [decodedLevel]
      ),
      pool.query(
        `UPDATE "User" SET paid_level = NULL WHERE paid_level = $1`,
        [decodedLevel]
      ),
      pool.query(
        `DELETE FROM "MembershipLevel" WHERE name = $1`,
        [decodedLevel]
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete level failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
