// 📄 File: src/lib/auth.ts (Client-only)

export type Role = "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

// ✅ For client-side fetch (safe for use in "use client" components)
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
