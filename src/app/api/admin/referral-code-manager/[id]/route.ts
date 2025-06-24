// 📄 src/app/api/admin/referral-code-manager/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { new_code } = await req.json();

  if (!new_code || typeof new_code !== "string") {
    return NextResponse.json({ error: "Missing or invalid new_code" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE "ReferralCode" SET code = $1 WHERE id = $2 RETURNING *`,
      [new_code.trim(), id]
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
