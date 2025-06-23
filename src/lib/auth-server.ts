// src/lib/auth-server.ts
import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type Role = "user" | "admin" | "super_admin";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

// For server-side use (layouts, pages, API routes)
export async function getUserFromCookies(): Promise<JWTUser | null> {
  const cookieStore = await cookies(); // ✅ Await is required
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return decodeUser(token);
}

export async function getUserFromRequest(req: Request): Promise<JWTUser | null> {
  const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
  if (!token) return null;
  return decodeUser(token);
}

async function decodeUser(token: string): Promise<JWTUser | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const possibleUser = payload as JWTPayload & Partial<JWTUser>;

    if (
      typeof possibleUser.id === "number" &&
      typeof possibleUser.email === "string" &&
      (possibleUser.role === "user" || possibleUser.role === "admin" || possibleUser.role === "super_admin")
    ) {
      return {
        id: possibleUser.id,
        email: possibleUser.email,
        role: possibleUser.role,
        name: possibleUser.name || "",
      };
    }
  } catch (err) {
    console.error("JWT decode failed:", err);
  }

  return null;
}
