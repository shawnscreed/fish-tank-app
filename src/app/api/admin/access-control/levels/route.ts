// File: src/app/api/admin/access-control/levels/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// ✅ GET: Fetch all membership levels from MembershipLevel table
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const res = await pool.query(`SELECT name FROM "MembershipLevel" ORDER BY name ASC`);
    const levels = res.rows.map((r) => r.name);
    return NextResponse.json({ levels });
  } catch (err: any) {
    console.error("❌ Failed to fetch membership levels:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST: Add a new level to MembershipLevel table
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const level = typeof body.level === "string" ? body.level.trim() : "";

    if (!level) {
      return NextResponse.json({ error: "Invalid level name" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO "MembershipLevel" (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING name`,
      [level]
    );

    const inserted = (result?.rowCount ?? 0) > 0;


    return NextResponse.json({
      success: true,
      message: inserted ? "Level added" : "Level already exists",
    });
  } catch (err: any) {
    console.error("❌ Failed to add membership level:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
