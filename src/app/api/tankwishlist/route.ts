import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { tank_id, species_type, species_id } = await req.json();

    // Validate species_type
    if (!["fish", "plant", "invert", "coral"].includes(species_type)) {
      return NextResponse.json({ error: "Invalid species_type" }, { status: 400 });
    }

    // Insert into wishlist
    const result = await pool.query(
      `INSERT INTO "TankWishlist" (tank_id, species_type, species_id) VALUES ($1, $2, $3) RETURNING *`,
      [tank_id, species_type, species_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("POST /api/tankwishlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
