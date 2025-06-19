import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/work — return all tank/work entries
export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(`SELECT * FROM "Work" ORDER BY id ASC`);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, tank_id, current_step, is_complete } = body;

    const result = await pool.query(
      `INSERT INTO "Work" (user_id, tank_id, current_step, is_complete)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, tank_id, current_step, is_complete ?? false]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/work error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
