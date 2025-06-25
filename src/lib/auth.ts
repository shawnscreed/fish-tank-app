import { jwtVerify, JWTPayload } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type Role = "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

async function decodeUser(token: string): Promise<JWTUser | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const possibleUser = payload as JWTPayload & Partial<JWTUser>;

    if (
      (typeof possibleUser.id === "number" || typeof possibleUser.id === "string") &&
      typeof possibleUser.email === "string" &&
      typeof possibleUser.role === "string"
    ) {
      return {
        id: Number(possibleUser.id),
        email: String(possibleUser.email),
        role: possibleUser.role as Role,
        name: possibleUser.name || "",
      };
    }
  } catch (err) {
    console.error("JWT verification failed", err);
  }
  return null;
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTUser | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return decodeUser(token);
}

export async function getUserFromCookies(): Promise<JWTUser | null> {
  if (!process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME !== "nodejs") {
    throw new Error("getUserFromCookies can only be used in App Router server components");
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies(); // ✅ FIXED: Added await
  const token = cookieStore.get("token")?.value;

  if (!token) return null;
  return decodeUser(token);
}

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
