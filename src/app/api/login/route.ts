import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  console.log("🔍 Login attempt with:");
  console.log("Email:", email);
  console.log("Password:", password); // Don't log in production

  try {
    const result = await pool.query(
      `SELECT id, email, name, password_hash, role FROM "User" WHERE email = $1`,
      [email]
    );

    console.log("DB Lookup result:", result.rows);

    if (result.rowCount === 0) {
      console.log("❌ No user found with this email.");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log("🔐 Password match:", valid);

    if (!valid) {
      console.log("❌ Password did not match.");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("✅ Login successful. Token set.");
    return response;
  } catch (err: any) {
    console.error("🔥 Login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
