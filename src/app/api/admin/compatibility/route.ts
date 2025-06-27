import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

/**
 * GET  /api/admin/compatibility
 *  -> ?species1=ID&species2=ID (optional filters)
 *
 * POST /api/admin/compatibility
 *  {
 *    "species1_id": 1,
 *    "species2_id": 2,
 *    "compatible": true,
 *    "reason": "Peaceful community fish"
 *  }
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "super_admin"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const s1  = url.searchParams.get("species1");
  const s2  = url.searchParams.get("species2");

  let where = "";
  const params: any[] = [];
  if (s1) { params.push(Number(s1)); where += ` AND species1_id = $${params.length}`; }
  if (s2) { params.push(Number(s2)); where += ` AND species2_id = $${params.length}`; }

  try {
    const rows = await pool.query(
      `SELECT id, species1_id, species2_id, compatible, reason
       FROM "SpeciesCompatibility"
       WHERE TRUE ${where}
       ORDER BY id`,
      params
    );
    return NextResponse.json(rows.rows);
  } catch (err: any) {
    console.error("GET compatibility admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "super_admin"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { species1_id, species2_id, compatible, reason } = body;

  if (!Number(species1_id) || !Number(species2_id) || typeof compatible !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO "SpeciesCompatibility"
         (species1_id, species2_id, compatible, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [species1_id, species2_id, compatible, reason ?? null]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    console.error("POST compatibility admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
