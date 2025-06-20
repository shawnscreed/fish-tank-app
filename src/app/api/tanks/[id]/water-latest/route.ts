// 📄 File: app/api/tanks/[id]/water-latest/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tankId = parseInt(id);

  try {
    const res = await pool.query(
      `SELECT * FROM "WaterTest" WHERE tank_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [tankId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(null); // ✅ send null if no test exists
    }

    return NextResponse.json(res.rows[0]);
  } catch (err) {
    console.error("❌ Water test fetch failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
