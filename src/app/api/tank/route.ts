// 📄 File: src/app/api/tank/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getToken } from "next-auth/jwt";

/*
  A minimal shape for the token we expect from next‑auth.
  `id` comes from your DB user ID column, `role` is a custom claim you added.
*/
type JWTToken = { id: number; role?: string | null } | null;

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
const isAdminRole = (role?: string | null) =>
  role === "admin" || role === "super_admin";

/* ------------------------------------------------------------------
   GET  /api/tank
   - Admins  → all active tanks, full rows
   - Regular → only their own active tanks (id + name)
------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const token = (await getToken({ req })) as JWTToken;

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let result;

    if (isAdminRole(token.role)) {
      result = await pool.query(
        `SELECT * FROM "Tank" WHERE in_use = TRUE ORDER BY id ASC`
      );
    } else {
      result = await pool.query(
        `SELECT id, name
           FROM "Tank"
          WHERE in_use = TRUE
            AND user_id = $1
          ORDER BY id ASC`,
        [token.id]
      );
    }

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/tank error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------
   POST  /api/tank   →  Admin‑only: create a tank
------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  const token = (await getToken({ req })) as JWTToken;

  if (!isAdminRole(token?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const fields = ["name", "water_type", "gallons", "in_use", "user_id"];
    const values = fields.map((field) => body[field]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO "Tank" (${fields.join(", ")})
      VALUES (${placeholders})
      RETURNING *;`;

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/tank error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------
   PUT  /api/tank   →  Admin‑only: update a tank
------------------------------------------------------------------ */
export async function PUT(req: NextRequest) {
  const token = (await getToken({ req })) as JWTToken;

  if (!isAdminRole(token?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, name, water_type, gallons, in_use } = await req.json();

    const result = await pool.query(
      `UPDATE "Tank"
         SET name = $1,
             water_type = $2,
             gallons = $3,
             in_use = $4
       WHERE id = $5
       RETURNING *;`,
      [name, water_type, gallons, in_use, id]
    );

    return result.rowCount === 0
      ? NextResponse.json({ error: "Not found" }, { status: 404 })
      : NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/tank error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ------------------------------------------------------------------
   DELETE  /api/tank?id=123   →  Admin‑only: soft‑delete a tank
------------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  const token = (await getToken({ req })) as JWTToken;

  if (!isAdminRole(token?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tank ID required" }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE "Tank" SET in_use = FALSE WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rowCount === 0
      ? NextResponse.json({ error: "Not found" }, { status: 404 })
      : NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/tank error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
