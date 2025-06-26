import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromServer } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const user = await getUserFromServer();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pool.query(`
      SELECT id, name, notes, buy_url, in_use
      FROM "Chemical"
      WHERE in_use = TRUE
      ORDER BY name ASC
    `);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
