// File: app/api/work/[id]/chemical/route.ts

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Fetch chemical logs for this work (tank) entry
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ await required

  try {
    const result = await pool.query(
      `
      SELECT tc.id, tc.amount, tc.notes, tc.added_at,
             c.name AS chemical_name, c.image_url
      FROM "TankChemical" tc
      JOIN "Chemical" c ON tc.chemical_id = c.id
      WHERE tc.work_id = $1
      ORDER BY tc.added_at DESC
      `,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /work/[id]/chemical error:", err);
    return NextResponse.json({ error: "Failed to fetch chemical additions" }, { status: 500 });
  }
}

// POST: Log a chemical addition for this tank (work)
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: workId } = await context.params;
  const { chemical_id, amount, notes } = await req.json();

  try {
    // Insert the log
    const insertResult = await pool.query(
      `INSERT INTO "TankChemical" (work_id, chemical_id, amount, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [workId, chemical_id, amount, notes]
    );

    const newId = insertResult.rows[0].id;

    // 🔁 Re-fetch with JOIN to get chemical_name
    const result = await pool.query(
      `SELECT tc.id, tc.amount, tc.notes, tc.added_at,
              c.name AS chemical_name, c.image_url
       FROM "TankChemical" tc
       JOIN "Chemical" c ON tc.chemical_id = c.id
       WHERE tc.id = $1`,
      [newId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("POST /work/[id]/chemical error:", err);
    return NextResponse.json({ error: "Failed to save chemical log" }, { status: 500 });
  }
}

