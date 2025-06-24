// File: src/app/api/admin/referral-code-manager/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT id, code, role, created_at
      FROM "ReferralCode"
      ORDER BY created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { code, role } = await req.json();

  if (!code || !role) {
    return NextResponse.json({ error: "Missing code or role" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "ReferralCode" (code, role) VALUES ($1, $2) RETURNING *`,
      [code, role]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
