import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getToken } from "next-auth/jwt";

async function isAdmin(req: NextRequest) {
  const token = await getToken({ req });
  return ["admin", "super_admin"].includes(token?.role as string);
}

/* GET  → list all rules */
export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, species1_id, species2_id, compatible, reason
     FROM "SpeciesCompatibility"
     ORDER BY id`
  );
  return NextResponse.json(rows);
}

/* POST → add new rule */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { species1_id, species2_id, compatible, reason } = await req.json();

  const { rows } = await pool.query(
    `INSERT INTO "SpeciesCompatibility"
       (species1_id, species2_id, compatible, reason)
     VALUES ($1,$2,$3,$4)
     RETURNING id, species1_id, species2_id, compatible, reason`,
    [species1_id, species2_id, compatible, reason]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
