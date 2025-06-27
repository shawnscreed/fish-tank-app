// src/app/api/species/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(`
    SELECT id,
           name,
           type,          -- 'fish' | 'plant' | 'invert'
           ph_low,
           ph_high,
           temp_low,
           temp_high
    FROM   "Species"
    ORDER  BY name
  `);
  return NextResponse.json(rows);
}
