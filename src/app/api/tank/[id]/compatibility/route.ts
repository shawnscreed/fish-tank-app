// 📄 src/app/api/tank/[id]/compatibility/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

type SpeciesRow = { id: number; name: string; type: "fish" };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = Number(id);

  /* ── Auth guard ─────────────────────────────── */
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    /* ── 1. Load all fish in the tank ─────────── */
    const { rows: species } = await pool.query<SpeciesRow>(
      `
      SELECT DISTINCT f.id, f.name, 'fish' AS type
      FROM "TankFish" tf
      JOIN "Fish"     f  ON f.id = tf.fish_id
      WHERE tf.tank_id = $1
      `,
      [tankId]
    );

    /* ── 2. Build compatibility matrix ────────── */
    const matrix: {
      species1_id: number;
      species2_id: number;
      compatible: boolean | null; // null = unknown / not in table
      reason?: string | null;
    }[] = [];

    for (let i = 0; i < species.length; i++) {
      for (let j = i + 1; j < species.length; j++) {
        const a = species[i].id;
        const b = species[j].id;

        const { rows } = await pool.query(
          `
          SELECT compatible, reason
          FROM "SpeciesCompatibility"
          WHERE
            (species1_id = $1 AND species2_id = $2) OR
            (species1_id = $2 AND species2_id = $1)
          LIMIT 1
          `,
          [a, b]
        );

        if (rows.length) {
          matrix.push({
            species1_id: a,
            species2_id: b,
            compatible: rows[0].compatible,
            reason: rows[0].reason,
          });
        } else {
          matrix.push({
            species1_id: a,
            species2_id: b,
            compatible: null, // unknown
            reason: null,
          });
        }
      }
    }

    return NextResponse.json({ species, matrix });
  } catch (err: any) {
    console.error("❌ Compatibility API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
