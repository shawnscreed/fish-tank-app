// File: src/app/api/admin/access-control/levels/[level]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// ✅ PUT: Rename a level
export async function PUT(
  req: NextRequest,
  context: { params: { level: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const oldLevel = decodeURIComponent(context.params.level);
  const { new_level } = await req.json();
  const newLevel = typeof new_level === "string" ? new_level.trim() : "";

  if (!newLevel) {
    return NextResponse.json({ error: "New level name is required" }, { status: 400 });
  }

  try {
    // Update MembershipLevel name
    await pool.query(
      `UPDATE "MembershipLevel" SET name = $1 WHERE name = $2`,
      [newLevel, oldLevel]
    );

    // Update references in User
    await pool.query(
      `UPDATE "User" SET paid_level = $1 WHERE paid_level = $2`,
      [newLevel, oldLevel]
    );

    // Update array references in PageAccessControl
    await pool.query(
      `UPDATE "PageAccessControl"
       SET required_levels = array_replace(required_levels, $2, $1)
       WHERE $2 = ANY(required_levels)`,
      [newLevel, oldLevel]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Rename level failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove a level
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ level: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { level } = await context.params;
  const decodedLevel = decodeURIComponent(level);

  try {
    // Remove the level from all page access rule arrays
    await pool.query(
      `UPDATE "PageAccessControl"
       SET required_levels = array_remove(required_levels, $1)
       WHERE $1 = ANY(required_levels)`,
      [decodedLevel]
    );

    // Null out users with this paid_level
    await pool.query(
      `UPDATE "User" SET paid_level = NULL WHERE paid_level = $1`,
      [decodedLevel]
    );

    // Delete the level itself
    await pool.query(
      `DELETE FROM "MembershipLevel" WHERE name = $1`,
      [decodedLevel]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete level failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
