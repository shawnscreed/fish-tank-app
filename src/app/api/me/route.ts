// ✅ File: src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserFromServer } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const user = await getUserFromServer();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.json(user);
}
