
// File: src/app/api/admin/user-account-manager/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs"; // make sure it's installed

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10); // Hash it

  try {
    const result = await pool.query(
      `INSERT INTO "User" (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, password_hash, role]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
