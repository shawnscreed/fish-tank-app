// File: src/app/api/admin/feedback-entry-viewer/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-server"; // ✅ Corrected import

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT id, user_id, message, created_at
      FROM "Feedback"
      ORDER BY created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("❌ Error fetching feedback:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
