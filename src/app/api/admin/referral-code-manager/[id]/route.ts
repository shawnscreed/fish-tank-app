// 📄 src/app/api/admin/referral-code-manager/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const id = context.params.id;
  const { code, role } = await req.json();

  if (!code || !role) {
    return NextResponse.json(
      { error: "Missing code or role" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `UPDATE "ReferralCode" SET code = $1, role = $2 WHERE id = $3 RETURNING *`,
      [code, role, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: result.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
