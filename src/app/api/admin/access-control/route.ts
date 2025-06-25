import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// 🚀 GET: Load access rules, user list, and defined membership levels
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [rulesRes, rawUsersRes, levelsRes] = await Promise.all([
      pool.query(`SELECT * FROM "PageAccessControl" ORDER BY page_route`),
      pool.query(`SELECT id, name, email, paid_level FROM "User" ORDER BY id`),
      pool.query(`SELECT name FROM "MembershipLevel" ORDER BY name ASC`),
    ]);

    const users = rawUsersRes.rows.map((u) => ({
      ...u,
      paid_level: u.paid_level || "Free",
    }));

    const levels = levelsRes.rows.map((r) => r.name);

    return NextResponse.json({
      rules: rulesRes.rows,
      users,
      levels,
    });
  } catch (err: any) {
    console.error("❌ Error loading access control data:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// 🚀 PUT: Update access control rule for a page
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { page_route, required_levels } = await req.json();

    if (
      typeof page_route !== "string" ||
      !Array.isArray(required_levels) ||
      !required_levels.every((lvl) => typeof lvl === "string")
    ) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Normalize and deduplicate
    const normalizedLevels = Array.from(
      new Set(
        required_levels.map(
          (lvl: string) =>
            lvl.charAt(0).toUpperCase() + lvl.slice(1).toLowerCase()
        )
      )
    );

    // Validate against MembershipLevel table
    const validLevelsRes = await pool.query(`SELECT name FROM "MembershipLevel"`);
    const validLevels = validLevelsRes.rows.map((r) => r.name);

    const invalidLevels = normalizedLevels.filter(
      (lvl) => !validLevels.includes(lvl)
    );

    if (invalidLevels.length > 0) {
      return NextResponse.json(
        { error: `Invalid membership levels: ${invalidLevels.join(", ")}` },
        { status: 400 }
      );
    }

    // Attempt update
    const updateRes = await pool.query(
      `UPDATE "PageAccessControl"
       SET required_levels = $1
       WHERE page_route = $2
       RETURNING *`,
      [normalizedLevels, page_route]
    );

    let updated = updateRes.rows[0];

    // If no record updated, insert new
    if (!updated) {
      const insertRes = await pool.query(
        `INSERT INTO "PageAccessControl" (page_route, required_levels)
         VALUES ($1, $2)
         RETURNING *`,
        [page_route, normalizedLevels]
      );
      updated = insertRes.rows[0];
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("❌ Error updating access rule:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
