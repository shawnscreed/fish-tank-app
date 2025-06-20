// File: app/api/chemicals/route.ts - Handle GET, POST, PUT, DELETE for chemical inventory

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: List all chemicals
export async function GET() {
  try {
    const result = await pool.query(`SELECT * FROM "Chemical" ORDER BY name`);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("GET /api/chemicals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new chemical
export async function POST(req: NextRequest) {
  const data = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO "Chemical" (name, purpose, purchase_link, notes, in_use)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.name,
        data.purpose,
        data.purchase_link,
        data.notes,
        data.in_use ?? true, // fallback to true
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("POST /api/chemicals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update a chemical by ID
export async function PUT(req: NextRequest) {
  const data = await req.json();

  try {
    const result = await pool.query(
      `UPDATE "Chemical"
       SET name = $1, notes = $2, purchase_link = $3, in_use = $4
       WHERE id = $5
       RETURNING *`,
      [data.name, data.notes, data.purchase_link, data.in_use, data.id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    console.error("PUT /api/chemicals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a chemical by ID
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    await pool.query(`DELETE FROM "Chemical" WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/chemicals error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
