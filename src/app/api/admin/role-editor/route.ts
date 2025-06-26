// 📄 src/app/api/admin/role-editor/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET – Return every user with their current role
 * Only accessible by admin or super_admin
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Return full user list with role, email, and name
    const result = await pool.query(`
      SELECT
        id  AS user_id,
        email,
        name,
        role
      FROM "User"
      ORDER BY id ASC
    `);

    return NextResponse.json(result.rows); // [{ user_id, email, name, role }, ...]
  } catch (err: any) {
    console.error("❌ Error fetching user roles:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT – Update a single user’s role
 * Route: /api/admin/role-editor/[userId]
 * (keeping existing logic in its own file under /[id]/route.ts)
 */
