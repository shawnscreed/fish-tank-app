import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromServer } from "@/lib/auth-server";

// 📥 GET all active reminders for user (or specific tank_id)
export async function GET(req: NextRequest) {
  const user = await getUserFromServer();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const tankId = url.searchParams.get("tank_id");

  try {
    let result;
    if (tankId) {
      // ✅ Only for one tank (faster)
      result = await pool.query(
        `SELECT tr.* FROM "TankReminder" tr
         JOIN "Tank" t ON tr.tank_id = t.id
         WHERE tr.in_use = TRUE AND t.user_id = $1 AND tr.tank_id = $2
         ORDER BY tr.next_due ASC`,
        [user.id, Number(tankId)]
      );
    } else {
      // ✅ All reminders for all user tanks
      result = await pool.query(
        `SELECT tr.* FROM "TankReminder" tr
         JOIN "Tank" t ON tr.tank_id = t.id
         WHERE tr.in_use = TRUE AND t.user_id = $1
         ORDER BY tr.next_due ASC`,
        [user.id]
      );
    }

    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/tank-reminder error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📥 POST create new reminder
export async function POST(req: NextRequest) {
  const user = await getUserFromServer();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tank_id, type, frequency_days, notes } = await req.json();
  const today = new Date().toISOString().split("T")[0];

  try {
    // ✅ Make sure user owns the tank
    const check = await pool.query(`SELECT * FROM "Tank" WHERE id = $1 AND user_id = $2`, [tank_id, user.id]);
    if (check.rowCount === 0) {
      return NextResponse.json({ error: "You do not own this tank" }, { status: 403 });
    }

    const result = await pool.query(
      `INSERT INTO "TankReminder" (tank_id, type, frequency_days, last_done, next_due, notes, in_use)
       VALUES ($1, $2, $3, $4, (CURRENT_DATE + $3 * INTERVAL '1 day'), $5, TRUE)
       RETURNING *`,
      [tank_id, type, frequency_days, today, notes]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/tank-reminder error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📥 PUT: Mark reminder done (recalculate next_due)
export async function PUT(req: NextRequest) {
  const user = await getUserFromServer();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    // ✅ Ensure reminder belongs to user's tank
    const check = await pool.query(
      `SELECT tr.* FROM "TankReminder" tr
       JOIN "Tank" t ON tr.tank_id = t.id
       WHERE tr.id = $1 AND t.user_id = $2`,
      [id, user.id]
    );
    if (check.rowCount === 0) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
    }

    const result = await pool.query(
      `UPDATE "TankReminder"
       SET last_done = CURRENT_DATE,
           next_due = CURRENT_DATE + frequency_days * INTERVAL '1 day'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/tank-reminder error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📥 DELETE: Soft delete reminder
export async function DELETE(req: NextRequest) {
  const user = await getUserFromServer();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  try {
    // ✅ Ensure user owns the reminder
    const check = await pool.query(
      `SELECT tr.* FROM "TankReminder" tr
       JOIN "Tank" t ON tr.tank_id = t.id
       WHERE tr.id = $1 AND t.user_id = $2`,
      [id, user.id]
    );
    if (check.rowCount === 0) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
    }

    await pool.query(`UPDATE "TankReminder" SET in_use = FALSE WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/tank-reminder error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
