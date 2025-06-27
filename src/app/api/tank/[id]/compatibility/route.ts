// 📄 src/app/api/tank/[id]/compatibility/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";
import pool from "@/lib/db";

export async function GET(
  _req: Request, // ✅ Use the built-in Fetch API Request
  context: { params: { id: string } }
) {
  const tankId = Number(context.params.id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number((session.user as any).id);

  const { rowCount } = await pool.query(
    `SELECT 1 FROM "Tank" WHERE id = $1 AND user_id = $2`,
    [tankId, userId]
  );
  if (!rowCount) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { rows: species } = await pool.query(
    `
      SELECT DISTINCT f.id, f.name, 'fish' AS type
      FROM "TankFish" tf
      JOIN "Fish" f ON f.id = tf.fish_id
      WHERE tf.tank_id = $1
    `,
    [tankId]
  );

  if (species.length === 0) {
    return NextResponse.json({ species, matrix: [] });
  }

  const ids = species.map((s) => s.id);
  const { rows: matrix } = await pool.query(
    `
      SELECT species1_id, species2_id, compatible, reason
      FROM "SpeciesCompatibility"
      WHERE species1_id = ANY ($1::int[])
         OR species2_id = ANY ($1::int[])
    `,
    [ids]
  );

  return NextResponse.json({ species, matrix });
}
