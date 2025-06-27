import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import pool from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tankId = Number(id);

    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number((session.user as any).id);
    const { rowCount } = await pool.query(
      `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
      [tankId, userId]
    );
    if (!rowCount)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // ── Load species ──
    const { rows: species } = await pool.query(
      `
      SELECT * FROM (
        SELECT CONCAT('fish-', f.id) AS id, f.name, 'fish' AS type,
               f.ph_low, f.ph_high, f.temp_low, f.temp_high
        FROM "TankFish" tf
        JOIN "Fish" f ON f.id = tf.fish_id
        WHERE tf.tank_id = $1

        UNION ALL
        SELECT CONCAT('plant-', p.id), p.name, 'plant',
               p.ph_low, p.ph_high, p.temp_low, p.temp_high
        FROM "TankPlant" tp
        JOIN "Plant" p ON p.id = tp.plant_id
        WHERE tp.tank_id = $1

        UNION ALL
        SELECT CONCAT('invert-', i.id), i.name, 'invert',
               i.ph_low, i.ph_high, i.temp_low, i.temp_high
        FROM "TankInvert" ti
        JOIN "Invert" i ON i.id = ti.invert_id
        WHERE ti.tank_id = $1
      ) s
      ORDER BY name;
      `,
      [tankId]
    );

    console.log("✅ Loaded species:", species);

    if (!species || !Array.isArray(species)) {
      console.error("❌ species is not an array:", species);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    if (!species.length)
      return NextResponse.json({ species: [], matrix: [] });

    // ── Load compatibility matrix ──
    const ids = species.map((s) => s.id);
    const { rows: matrix } = await pool.query(
      `
      SELECT species1_id, species2_id, compatible, reason
      FROM   "SpeciesCompatibility"
      WHERE  species1_id = ANY ($1::text[])
         OR  species2_id = ANY ($1::text[])
      `,
      [ids]
    );

    console.log("✅ Loaded matrix:", matrix);

    if (!matrix || !Array.isArray(matrix)) {
      console.error("❌ matrix is not an array:", matrix);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    return NextResponse.json({ species, matrix });

  } catch (err: any) {
    console.error("💥 Tank compatibility error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
