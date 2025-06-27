import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getToken } from "next-auth/jwt";

async function isAdmin(req: NextRequest) {
  const token = await getToken({ req });
  return ["admin", "super_admin"].includes(token?.role as string);
}

/* PUT → update rule */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ruleId = Number(id);

  const { species1_id, species2_id, compatible, reason } = await req.json();

  const { rows } = await pool.query(
    `UPDATE "SpeciesCompatibility"
     SET species1_id = $1,
         species2_id = $2,
         compatible   = $3,
         reason       = $4
     WHERE id = $5
     RETURNING id, species1_id, species2_id, compatible, reason`,
    [species1_id, species2_id, compatible, reason, ruleId]
  );

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

/* DELETE → remove rule */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ruleId = Number(id);

  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { rowCount } = await pool.query(
    `DELETE FROM "SpeciesCompatibility" WHERE id = $1`,
    [ruleId]
  );

  return rowCount
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
