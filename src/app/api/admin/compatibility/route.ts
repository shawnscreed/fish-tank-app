import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getToken } from "next-auth/jwt";

async function isAdmin(req: NextRequest) {
  const token = await getToken({ req });
  return ["admin", "super_admin"].includes(token?.role as string);
}

/* GET → list all rules */
export async function GET() {
  const { rows } = await pool.query(`
    SELECT id, species1_id, species2_id, compatible, reason
    FROM   "SpeciesCompatibility"
    ORDER  BY id
  `);
  return NextResponse.json(rows);
}

/* POST → add new rule (no duplicates) */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { species1_id, species2_id, compatible, reason } = await req.json();

  /* self-comparison check */
  if (species1_id === species2_id) {
    return NextResponse.json(
      { error: "Cannot compare species to itself." },
      { status: 400 }
    );
  }

  /* duplicate check */
  const { rowCount: dup } = await pool.query(
    `SELECT 1
       FROM "SpeciesCompatibility"
      WHERE (species1_id = $1 AND species2_id = $2)
         OR (species1_id = $2 AND species2_id = $1)`,
    [species1_id, species2_id]
  );
  if (dup)
    return NextResponse.json(
      { error: "A rule for this pair already exists." },
      { status: 409 }
    );

  /* insert */
  const { rows } = await pool.query(
    `INSERT INTO "SpeciesCompatibility"
       (species1_id, species2_id, compatible, reason)
     VALUES ($1,$2,$3,$4)
     RETURNING id, species1_id, species2_id, compatible, reason`,
    [species1_id, species2_id, compatible, reason]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
