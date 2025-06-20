import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  const hash = await bcrypt.hash(password, 10); // 👈 this is what you're asking about

  try {
    const result = await pool.query(
      `INSERT INTO "User" (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name, email, hash, "user"]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
