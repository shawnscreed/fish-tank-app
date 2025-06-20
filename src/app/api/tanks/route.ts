import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, gallons, water_type, user_id } = body;

  if (!name || !gallons || !water_type || !user_id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "Tank" (name, gallons, water_type, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, gallons, water_type, user_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Tank insert error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
