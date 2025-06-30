import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
// Import your auth helper (adjust path as needed)
import { getUserFromRequest } from "@/lib/auth-server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ tank_id: string }> }
) {
  try {
    // Get current user from request/session
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tank_id } = await context.params;
    const tankId = parseInt(tank_id, 10);
    if (isNaN(tankId)) {
      return NextResponse.json({ error: "Invalid tank_id" }, { status: 400 });
    }

    // Verify user owns the tank
    const ownerCheck = await pool.query(
      `SELECT user_id FROM "Tank" WHERE id = $1`,
      [tankId]
    );
    if (ownerCheck.rows.length === 0) {
      return NextResponse.json({ error: "Tank not found" }, { status: 404 });
    }
    // Convert both to strings before comparing
    if (String(ownerCheck.rows[0].user_id) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Query wishlist with species name included
    const result = await pool.query(
      `
      SELECT tw.*,
        COALESCE(f.name, p.name, i.name, c.name) AS name
      FROM "TankWishlist" tw
      LEFT JOIN "Fish" f ON tw.species_type = 'fish' AND tw.species_id = f.id
      LEFT JOIN "Plant" p ON tw.species_type = 'plant' AND tw.species_id = p.id
      LEFT JOIN "Invert" i ON tw.species_type = 'invert' AND tw.species_id = i.id
      LEFT JOIN "Coral" c ON tw.species_type = 'coral' AND tw.species_id = c.id
      WHERE tw.tank_id = $1
      ORDER BY tw.created_at DESC
      `,
      [tankId]
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("GET /api/tankwishlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE handler remains unchanged
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ wishlist_id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wishlist_id } = await context.params;
    const wishlistId = parseInt(wishlist_id, 10);
    if (isNaN(wishlistId)) {
      return NextResponse.json({ error: "Invalid wishlist_id" }, { status: 400 });
    }

    // Verify user owns the tank associated with this wishlist item
    const ownershipCheck = await pool.query(
      `SELECT t.user_id
       FROM "TankWishlist" tw
       JOIN "Tank" t ON tw.tank_id = t.id
       WHERE tw.id = $1`,
      [wishlistId]
    );

    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    }
    // Convert both to strings before comparing
    if (String(ownershipCheck.rows[0].user_id) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the wishlist item
    await pool.query(
      `DELETE FROM "TankWishlist" WHERE id = $1`,
      [wishlistId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/tankwishlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
