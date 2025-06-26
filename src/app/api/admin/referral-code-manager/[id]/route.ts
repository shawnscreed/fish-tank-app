import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const { code, role } = await req.json();

  if (!code || typeof code !== "string" || !role || typeof role !== "string") {
    return NextResponse.json({ error: "Missing or invalid code/role" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE "ReferralCode" SET code = $1, role = $2 WHERE id = $3 RETURNING *`,
      [code.trim(), role.trim(), id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
    }

    return NextResponse.json({ updated: result.rows[0] });
  } catch (err: any) {
    console.error("Referral code update failed:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
