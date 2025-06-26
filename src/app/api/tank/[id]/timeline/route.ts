// 📄 File: src/app/api/tank/[id]/timeline/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromServer } from "@/lib/auth-server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tankId = Number(id);

  const user = await getUserFromServer();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events: any[] = [];

    // ✅ Fish added
    const fishRes = await pool.query(`
      SELECT f.name, a.created_at
      FROM "TankFishAssignment" a
      JOIN "Fish" f ON a.fish_id = f.id
      WHERE a.tank_id = $1
    `, [tankId]);

    fishRes.rows.forEach((row) => {
      events.push({
        type: "fish_added",
        date: row.created_at,
        summary: `Fish added: ${row.name}`,
      });
    });

    // ✅ Water logs
    const waterRes = await pool.query(
      `SELECT * FROM "WaterLog" WHERE tank_id = $1`,
      [tankId]
    );

    waterRes.rows.forEach((row) => {
      events.push({
        type: "water_log",
        date: row.created_at,
        summary: "Water test recorded",
        details: `pH: ${row.ph}, Ammonia: ${row.ammonia}, Nitrate: ${row.nitrate}`,
      });
    });

    // ✅ Maintenance logs
    const maintRes = await pool.query(
      `SELECT * FROM "TankMaintenanceLog" WHERE tank_id = $1`,
      [tankId]
    );

    maintRes.rows.forEach((row) => {
      events.push({
        type: "maintenance",
        date: row.created_at,
        summary: "Maintenance performed",
        details: row.notes || "",
      });
    });

    // ✅ Reminder completions
    const reminderRes = await pool.query(`
      SELECT * FROM "TankReminder"
      WHERE tank_id = $1 AND last_done IS NOT NULL
    `, [tankId]);

    reminderRes.rows.forEach((row) => {
      events.push({
        type: "reminder_done",
        date: row.last_done,
        summary: `Reminder completed: ${row.type}`,
      });
    });

    // ✅ Sort by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Timeline API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
