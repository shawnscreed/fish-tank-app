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
    console.log("🐟 Checking compatibility for tank ID:", tankId);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("⛔ No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    console.log("👤 Authenticated user:", userId);

    const tankResult = await pool.query(
      `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
      [tankId, userId]
    );
    if (!tankResult.rowCount) {
      console.log("❌ Tank doesn't belong to user or doesn't exist");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Load species ──
    console.log("🔄 Loading species in tank...");

    const speciesQuery = await pool.query(
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

    const species = speciesQuery.rows;
    console.log("✅ Species loaded:", species);

    if (!species || !Array.isArray(species)) {
      console.log("❌ Species result invalid");
      return NextResponse.json({ error: "Species query failed" }, { status: 500 });
    }

    if (!species.length) {
      console.log("ℹ️ No species in tank");
      return NextResponse.json({ species: [], matrix: [] });
    }

    const ids = species.map((s) => s.id);
    console.log("🔍 Species IDs:", ids);

    const matrixQuery = await pool.query(
      `
      SELECT species1_id, species2_id, compatible, reason
      FROM "SpeciesCompatibility"
      WHERE species1_id = ANY ($1::text[])
         OR species2_id = ANY ($1::text[])
      `,
      [ids]
    );

    const matrix = matrixQuery.rows;
    console.log("✅ Compatibility matrix:", matrix);

    return NextResponse.json({ species, matrix });

  } catch (err: any) {
    console.error("💥 Compatibility route crashed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
