// File: app/api/work/[id]/chemical/route.ts - Handles GET and POST for chemical additions

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Retrieve all chemical additions for a tank
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const result = await pool.query(
      `SELECT * FROM "ChemicalAddition" WHERE tank_id = $1 ORDER BY added_at DESC`,
      [id]
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/work/[id]/chemical error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new chemical addition entry
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const data = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO "ChemicalAddition" (tank_id, chemical_name, amount, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, data.chemical_name, data.amount, data.notes]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/work/[id]/chemical error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
