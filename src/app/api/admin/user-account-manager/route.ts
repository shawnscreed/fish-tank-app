// File: src/app/api/admin/user-account-manager/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req); // ✅ fixed

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

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req); // ✅ fixed

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

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

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req); // ✅ fixed

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, newPassword } = await req.json();

  if (!userId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  try {
    const password_hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE "User" SET password_hash = $1 WHERE id = $2`,
      [password_hash, userId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Password update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req); // ✅ fixed

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userId = Number(req.nextUrl.searchParams.get("userId"));

  if (!userId || isNaN(userId)) {
    return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 400 });
  }

  try {
    await pool.query(`DELETE FROM "User" WHERE id = $1`, [userId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
