// File: src/app/api/tanks/[id]/stocking-suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = parseInt(id, 10);
  if (Number.isNaN(tankId)) {
    return NextResponse.json({ error: "Invalid tank id" }, { status: 400 });
  }

  // Helper to avoid empty arrays causing SQL errors
  const safeArray = (arr: number[]) => (arr.length > 0 ? arr : [-1]);

  try {
    // 1. Get tank water_type
   const tankResult = await pool.query(
  `SELECT water_type FROM public."Tank" WHERE id = $1`,
  [tankId]
);


    if (tankResult.rows.length === 0) {
      return NextResponse.json({ error: "Tank not found" }, { status: 404 });
    }

    const waterType: string = tankResult.rows[0].water_type;

    // 2. Get IDs of all species currently assigned to the tank
    const fishResult = await pool.query(
      `SELECT fish_id FROM "TankFish" WHERE tank_id = $1`,
      [tankId]
    );
    const plantResult = await pool.query(
      `SELECT plant_id FROM "TankPlant" WHERE tank_id = $1`,
      [tankId]
    );
    const invertResult = await pool.query(
      `SELECT invert_id FROM "TankInvert" WHERE tank_id = $1`,
      [tankId]
    );
    const coralResult = await pool.query(
      `SELECT coral_id FROM "TankCoral" WHERE tank_id = $1`,
      [tankId]
    );

    const stockedFishIds = fishResult.rows.map((r) => r.fish_id);
    const stockedPlantIds = plantResult.rows.map((r) => r.plant_id);
    const stockedInvertIds = invertResult.rows.map((r) => r.invert_id);
    const stockedCoralIds = coralResult.rows.map((r) => r.coral_id);

    // 3. Query compatible fish not already in tank
    const fishQuery = await pool.query(
      `
      SELECT * FROM "Fish"
      WHERE (water_type = $1 OR $1 = 'brackish')
      AND id != ALL($2::int[])
      ORDER BY name
      `,
      [waterType, safeArray(stockedFishIds)]
    );

    // 4. Query compatible plants not already in tank
    const plantQuery = await pool.query(
      `
      SELECT * FROM "Plant"
      WHERE (water_type = $1 OR $1 = 'brackish')
      AND id != ALL($2::int[])
      ORDER BY name
      `,
      [waterType, safeArray(stockedPlantIds)]
    );

    // 5. Query compatible inverts not already in tank
    const invertQuery = await pool.query(
      `
      SELECT * FROM "Invert"
      WHERE (water_type = $1 OR $1 = 'brackish')
      AND id != ALL($2::int[])
      ORDER BY name
      `,
      [waterType, safeArray(stockedInvertIds)]
    );

    // 6. Query compatible corals (only for salt or brackish) not in tank
    let coralRows = [];
    if (waterType === "salt" || waterType === "brackish") {
      const coralQuery = await pool.query(
        `
        SELECT * FROM "Coral"
        WHERE (water_type = $1 OR $1 = 'brackish')
        AND id != ALL($2::int[])
        ORDER BY name
        `,
        [waterType, safeArray(stockedCoralIds)]
      );
      coralRows = coralQuery.rows;
    }

    // 7. Combine all results into one array with type field
    const suggestions = [
      ...fishQuery.rows.map((r) => ({ ...r, type: "fish" })),
      ...plantQuery.rows.map((r) => ({ ...r, type: "plant" })),
      ...invertQuery.rows.map((r) => ({ ...r, type: "invert" })),
      ...coralRows.map((r) => ({ ...r, type: "coral" })),
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching stocking suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
