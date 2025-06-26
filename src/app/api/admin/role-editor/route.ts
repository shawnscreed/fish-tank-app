// File: src/app/api/admin/role-editor/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// 🔐 GET: Return all users with their current roles
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM "User"
      ORDER BY created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching user roles:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
