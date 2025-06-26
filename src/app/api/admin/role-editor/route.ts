// Example fix: src/app/api/admin/role-editor/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await pool.query(`SELECT * FROM "Role" ORDER BY id ASC`);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
