import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/serverAuthOptions";

export type Role = "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

// ✅ For server API routes
export async function getUserFromRequest(): Promise<JWTUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as Role, // ✅ fix here
    name: session.user.name || "",
  };
}

// ✅ For server components (App Router)
export async function getUserFromCookies(): Promise<JWTUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as Role, // ✅ fix here
    name: session.user.name || "",
  };
}

// ✅ For client-side fetch (optional helper)
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
