import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await pool.query(`
      SELECT tr.*, t.name AS tank_name
      FROM "TankReminder" tr
      JOIN "Tank" t ON tr.tank_id = t.id
      WHERE t.user_id = $1 AND tr.in_use = TRUE
      ORDER BY tr.next_due ASC
    `, [user.id]);

    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tank_id, type, frequency_days, notes } = await req.json();
  const today = new Date().toISOString().split("T")[0];

  try {
    const result = await pool.query(`
      INSERT INTO "TankReminder" (tank_id, type, frequency_days, last_done, next_due, notes)
      VALUES ($1, $2, $3, $4, (CURRENT_DATE + $3 * INTERVAL '1 day'), $5)
      RETURNING *
    `, [tank_id, type, frequency_days, today, notes]);

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  const { id } = await req.json();
  try {
    const result = await pool.query(`
      UPDATE "TankReminder"
      SET last_done = CURRENT_DATE,
          next_due = CURRENT_DATE + frequency_days * INTERVAL '1 day'
      WHERE id = $1
      RETURNING *;
    `, [id]);

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    await pool.query(`UPDATE "TankReminder" SET in_use = FALSE WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
