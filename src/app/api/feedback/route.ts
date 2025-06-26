import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromServer } from "@/lib/auth-server"; // ✅


export async function POST(req: NextRequest) {
 const user = await getUserFromServer();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { subject, message, rating } = body;

  try {
    const result = await pool.query(
      `INSERT INTO "Feedback" (user_id, subject, message, rating)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, subject, message, rating || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving feedback:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
