import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "super_admin"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const rowId  = Number(id);
  const body   = await req.json();
  const { compatible, reason } = body;

  if (typeof compatible !== "boolean" && reason === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE "SpeciesCompatibility"
         SET compatible = COALESCE($2, compatible),
             reason     = COALESCE($3, reason)
       WHERE id = $1
       RETURNING *`,
      [rowId, compatible, reason ?? null]
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("PUT compatibility admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "super_admin"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const rowId  = Number(id);

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM "SpeciesCompatibility" WHERE id = $1`,
      [rowId]
    );
    if (rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE compatibility admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
