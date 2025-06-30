import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-server";

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
    if (String(ownershipCheck.rows[0].user_id) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the wishlist item
    await pool.query(`DELETE FROM "TankWishlist" WHERE id = $1`, [wishlistId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/tankwishlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
