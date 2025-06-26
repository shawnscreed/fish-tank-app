// 📄 src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET /api/products
 * Returns the list of chemicals that are flagged as in_use = TRUE.
 * Response shape:
 *   [
 *     { id: 1, name: "Prime", buy_url: "https://...", notes: "Water conditioner" },
 *     ...
 *   ]
 */
export async function GET(_req: NextRequest) {
  // 🔐 Require an authenticated session (any role)
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        COALESCE(buy_url, '')  AS buy_url,
        COALESCE(notes,    '') AS notes
      FROM "Chemical"
      WHERE in_use IS TRUE
      ORDER BY name ASC
    `);

    return NextResponse.json(result.rows); // [{ id, name, buy_url, notes }, ...]
  } catch (err: any) {
    console.error("❌ /api/products error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
