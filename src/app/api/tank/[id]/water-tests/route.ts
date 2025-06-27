// 📄 src/app/api/tank/[id]/water-tests/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

// 🧠 Helper to check ownership
async function tankBelongsToUser(tankId: number, userId: number) {
  const result = await pool.query(
    `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, userId]
  );
return (result.rowCount ?? 0) > 0;

}

// ─────────────────────────────────────────────
// GET  /api/tank/[id]/water-tests
// ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = Number(id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const authorized = await tankBelongsToUser(tankId, userId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM "TankWaterTest"
      WHERE tank_id = $1
      ORDER BY test_date DESC
      `,
      [tankId]
    );

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// POST /api/tank/[id]/water-tests
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = Number(id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const authorized = await tankBelongsToUser(tankId, userId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

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
    notes = null
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
        tankId,
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

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("POST /api/tank/[id]/water-tests error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
