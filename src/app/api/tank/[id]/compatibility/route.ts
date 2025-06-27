import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

type SpeciesRow = { id: number; name: string; type: "fish" };
type MatrixRow  = {
  species1_id: number;
  species2_id: number;
  compatible: boolean | null;
  reason: string | null;
};

export async function GET(
  _req: Request,                        // 1️⃣  use the standard Request type
  { params }: { params: { id: string } }  // 2️⃣  plain params object
) {
  const tankId = Number(params.id);

  /* ───── Auth guard ───── */
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number((session.user as any).id);

  /* ───── Verify ownership ───── */
  const { rowCount: owns } = await pool.query(
    `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, userId]
  );
  if (!owns) {
    console.warn(`❌ User ${userId} tried to access tank ${tankId}`);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    /* ── 1. Fish in this tank ── */
    const { rows: species } = await pool.query<SpeciesRow>(
      `
        SELECT DISTINCT f.id, f.name, 'fish' AS type
        FROM "TankFish" tf
        JOIN "Fish"     f ON f.id = tf.fish_id
        WHERE tf.tank_id = $1
      `,
      [tankId]
    );

    if (species.length === 0) {
      return NextResponse.json({ species, matrix: [] });
    }

    /* ── 2. Compatibility rules in one query ── */
    const speciesIds = species.map((s) => s.id);     // e.g. [24,16,23]

    const { rows: matrix } = await pool.query<MatrixRow>(
      `
        SELECT species1_id,
               species2_id,
               compatible,
               reason
        FROM "SpeciesCompatibility"
        WHERE species1_id = ANY ($1::int[])
           OR species2_id = ANY ($1::int[])
      `,
      [speciesIds]
    );

    /* ── 3. Return JSON ── */
    return NextResponse.json({ species, matrix });
  } catch (err: any) {
    console.error("❌ Compatibility API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
