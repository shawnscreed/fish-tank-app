// 📁 File: src/lib/auth.ts

import { jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type Role = "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

// ✅ Shared decode logic
async function decodeUser(token: string): Promise<JWTUser | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const possibleUser = payload as JWTPayload & Partial<JWTUser>;

    if (
      typeof possibleUser.id === "number" &&
      typeof possibleUser.email === "string" &&
      typeof possibleUser.role === "string"
    ) {
      return {
        id: possibleUser.id,
        email: possibleUser.email,
        role: possibleUser.role as Role,
        name: possibleUser.name || "",
      };
    }
  } catch (err) {
    console.error("JWT verification failed", err);
  }
  return null;
}

// ✅ For API Routes (Request object)
export async function getUserFromRequest(req: Request): Promise<JWTUser | null> {
  const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
  if (!token) return null;
  return decodeUser(token);
}

// ✅ For Server Components (App Router only)
export async function getUserFromCookies(): Promise<JWTUser | null> {
  if (!process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME !== "nodejs") {
    throw new Error("getUserFromCookies can only be used in App Router server components");
  }

  // Lazy load to avoid breaking Pages Router
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies(); // ✅ await the promise
const token = cookieStore.get("token")?.value;

  if (!token) return null;
  return decodeUser(token);
}

// ✅ For Client Components (calls /api/me)
export async function getUserFromClientCookies(): Promise<JWTUser | null> {
  try {
    const res = await fetch("/api/me");
    if (!res.ok) return null;
    const user = await res.json();
    return user as JWTUser;
  } catch (err) {
    console.error("Failed to fetch user from /api/me:", err);
    return null;
  }
}
