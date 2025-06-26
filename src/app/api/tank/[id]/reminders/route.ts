import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromServer } from "@/lib/auth-server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getUserFromServer();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, frequency_days, notes } = await req.json();
    const frequency = Number(frequency_days);
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + frequency);

    const result = await pool.query(
      `INSERT INTO "TankReminder" (tank_id, type, frequency_days, last_done, next_due, notes, in_use)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [id, type, frequency, today, nextDue.toISOString().slice(0, 10), notes || ""]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("❌ Reminder insert error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
