import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * GET /api/species
 * Returns [{ id, name, type }]
 */
export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, name, type FROM "Species" ORDER BY name`
  );
  return NextResponse.json(rows);
}
