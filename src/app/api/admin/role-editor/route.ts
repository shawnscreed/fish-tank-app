// 📄 src/app/api/admin/role-editor/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await pool.query(`
      SELECT DISTINCT role FROM "User"
      ORDER BY role ASC
    `);

    return NextResponse.json(result.rows); // returns [{ role: "admin" }, ...]
  } catch (err: any) {
    console.error("❌ Error fetching roles:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
