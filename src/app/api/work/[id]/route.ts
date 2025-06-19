import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // PostgreSQL connection from shared config

/**
 * GET /api/work/:id
 * Fetch a single tank (work entry) by its ID
 */
// ✅ GET /api/work?user_id=1
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // ✅ Correct use

  try {
    const result = await pool.query(
      'SELECT * FROM "Work" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


/**
 * DELETE /api/work/:id
 * Removes a tank entry by ID
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await pool.query('DELETE FROM "Work" WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/work/:id error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/work/:id
 * Assigns a fish, plant, invert, or coral to a tank
 */
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { type, entryId } = await req.json();
   const { id } = await context.params; // ✅ Correct use
  const tankId = parseInt(id);

  try {
    if (type === "fish") {
      await pool.query(
        'INSERT INTO "TankFish" (tank_id, fish_id) VALUES ($1, $2)',
        [tankId, entryId]
      );
    } else if (type === "plant") {
      await pool.query(
        'INSERT INTO "TankPlant" (tank_id, plant_id) VALUES ($1, $2)',
        [tankId, entryId]
      );
    } else if (type === "coral") {
      await pool.query(
        'INSERT INTO "TankCoral" (tank_id, coral_id) VALUES ($1, $2)',
        [tankId, entryId]
      );
    } else if (type === "inverts") {
      await pool.query(
        'INSERT INTO "TankInvert" (tank_id, invert_id) VALUES ($1, $2)',
        [tankId, entryId]
      );
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/work/:id error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/work/:id
 * Updates fields for a specific tank
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  const allowedList: (keyof typeof body)[] = [
    "water_type",
    "gallons",
    "fish_id"
  ];

  const allowedFields = Object.keys(body).filter((key) =>
    allowedList.includes(key as keyof typeof body)
  );

  if (allowedFields.length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const updates = allowedFields
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(", ");
  const values = allowedFields.map((key) => body[key]);

  try {
    const result = await pool.query(
      `UPDATE "Work" SET ${updates} WHERE id = $${allowedFields.length + 1} RETURNING *`,
      [...values, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("PUT /api/work/:id error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
