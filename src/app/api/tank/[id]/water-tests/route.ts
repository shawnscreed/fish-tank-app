// 📄 src/app/api/tank/[id]/water-tests/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// ───────────────────────────────────
// GET  /api/tank/[id]/water-tests
// ───────────────────────────────────
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM "TankWaterTest"
      WHERE tank_id = $1
      ORDER BY test_date DESC
      `,
      [id]
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ───────────────────────────────────
// POST /api/tank/[id]/water-tests
// ───────────────────────────────────
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body      = await req.json();

  // Convert empty strings to null so PG accepts them for NUMERIC columns
  const numOrNull = (v: unknown) =>
    v === "" || v === null || v === undefined ? null : Number(v);

  const {
    ph,
    hardness,
    salinity,
    ammonia,
    nitrite,
    nitrate,
    temperature,
    notes = null        // optional text column
  } = body;

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO "TankWaterTest"
        (tank_id, ph, hardness, salinity, ammonia, nitrite, nitrate, temperature, notes)
      VALUES
        ($1,      $2, $3,       $4,       $5,      $6,      $7,      $8,         $9)
      RETURNING *
      `,
      [
        id,
        numOrNull(ph),
        numOrNull(hardness),
        numOrNull(salinity),
        numOrNull(ammonia),
        numOrNull(nitrite),
        numOrNull(nitrate),
        numOrNull(temperature),
        notes
      ]
    );

    // Return the inserted row so the UI can prepend it without refetching
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("POST /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
