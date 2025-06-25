// 📄 /src/app/api/admin/access-control/rescan/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pool from "@/lib/db";

// Define root folder and ignored routes
const pagesDir = path.resolve(process.cwd(), "src/app/dashboard");

async function getAllDashboardRoutes(): Promise<string[]> {
  const entries = fs.readdirSync(pagesDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() || entry.name.endsWith(".tsx"))
    .map((entry) => {
      const routeName = entry.name.replace(/\.tsx$/, "");
      if (routeName === "page") return "/dashboard";
      return `/dashboard/${routeName}`;
    })
    .filter((route) => route !== "/dashboard"); // Skip base route
}

export async function POST() {
  try {
    const routes = await getAllDashboardRoutes();

    for (const route of routes) {
      const existing = await pool.query(
        `SELECT * FROM "PageAccessControl" WHERE page_route = $1`,
        [route]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO "PageAccessControl" (page_route, required_levels) VALUES ($1, $2)`,
          [route, ['Free']] // Capitalized to match MembershipLevel values
        );
      }
    }

    const [rulesRes, usersRes, levelsRes] = await Promise.all([
      pool.query(`SELECT id, page_route, required_levels FROM "PageAccessControl" ORDER BY page_route`),
      pool.query(`SELECT id, name, email, paid_level FROM "User" ORDER BY id`),
      pool.query(`SELECT name FROM "MembershipLevel" ORDER BY name ASC`),
    ]);

    const levels = levelsRes.rows.map((r) => r.name);

    return NextResponse.json({
      rules: rulesRes.rows,
      users: usersRes.rows,
      levels,
    });
  } catch (err) {
    console.error("❌ Error during rescan:", err);
    return NextResponse.json({ error: "Failed to rescan pages" }, { status: 500 });
  }
}
