import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getToken } from "next-auth/jwt";

async function isAdmin(req: NextRequest) {
  const token = await getToken({ req });
  return ["admin", "super_admin"].includes(token?.role as string);
}

/* ───────── PUT – update a rule ───────── */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const ruleId = Number(id);

  let { species1_id, species2_id, compatible, reason } = await req.json();

  /* normalise IDs to lowercase */
  species1_id = species1_id.toLowerCase();
  species2_id = species2_id.toLowerCase();

  /* self-compare guard */
  if (species1_id === species2_id)
    return NextResponse.json(
      { error: "Cannot compare species to itself." },
      { status: 400 }
    );

  /* duplicate check, excluding this rule */
  const { rowCount: dup } = await pool.query(
    `
    SELECT 1
    FROM   "SpeciesCompatibility"
    WHERE  id <> $3
      AND ((species1_id = $1 AND species2_id = $2)
        OR (species1_id = $2 AND species2_id = $1))
    `,
    [species1_id, species2_id, ruleId]
  );
  if (dup)
    return NextResponse.json(
      { error: "Another rule for this pair already exists." },
      { status: 409 }
    );

  /* update */
  const { rows } = await pool.query(
    `
    UPDATE "SpeciesCompatibility"
       SET species1_id = $1,
           species2_id = $2,
           compatible  = $3,
           reason      = $4
     WHERE id = $5
   RETURNING id, species1_id, species2_id, compatible, reason
    `,
    [species1_id, species2_id, compatible, reason, ruleId]
  );

  if (!rows.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(rows[0]);
}

/* ───────── DELETE – remove a rule ───────── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const ruleId = Number(id);

  const { rowCount } = await pool.query(
    `DELETE FROM "SpeciesCompatibility" WHERE id = $1`,
    [ruleId]
  );

  return rowCount
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
