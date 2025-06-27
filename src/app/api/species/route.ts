import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM (
  -- Fish
  SELECT CONCAT('fish-', f.id) AS id,
         f.name                AS name,
         'fish'                AS type,
         f.ph_low              AS ph_low,
         f.ph_high             AS ph_high,
         f.temp_low            AS temp_low,
         f.temp_high           AS temp_high
  FROM "TankFish" tf
  JOIN "Fish" f ON f.id = tf.fish_id
  WHERE tf.tank_id = $1

  UNION ALL

  -- Plant (missing columns default to NULL)
  SELECT CONCAT('plant-', p.id) AS id,
         p.name                 AS name,
         'plant'                AS type,
         NULL                   AS ph_low,
         NULL                   AS ph_high,
         NULL                   AS temp_low,
         NULL                   AS temp_high
  FROM "TankPlant" tp
  JOIN "Plant" p ON p.id = tp.plant_id
  WHERE tp.tank_id = $1

  UNION ALL

  -- Invert (only id and name available)
  SELECT CONCAT('invert-', i.id) AS id,
         i.name                  AS name,
         'invert'                AS type,
         NULL                    AS ph_low,
         NULL                    AS ph_high,
         NULL                    AS temp_low,
         NULL                    AS temp_high
  FROM "TankInvert" ti
  JOIN "Invert" i ON i.id = ti.invert_id
  WHERE ti.tank_id = $1
) s
ORDER BY name;

    `);

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("💥 /api/species error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
