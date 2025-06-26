// 📄 File: src/lib/auth-server.ts

import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export type Role = "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

const validRoles: Role[] = ["user", "admin", "super_admin", "sub_admin", "beta_user"];

// ✅ For Server Components (SSR pages)
export async function getUserFromServer(): Promise<JWTUser> {
  const token = await getToken({ req: null as any }); // `req` must be passed as null in SSR
  if (!token?.id || !token.email) {
    console.warn("🔒 No valid session found – redirecting");
    redirect("/login");
  }

  const id = Number(token.id);
  const role = validRoles.includes(token.role as Role) ? (token.role as Role) : "user";

  return {
    id,
    email: token.email,
    role,
    name: token.name ?? "",
  };
}

// ✅ For API Routes
export async function getUserFromRequest(req: NextRequest): Promise<JWTUser | null> {
  const token = await getToken({ req });

  if (!token?.id || !token.email) return null;

  const id = Number(token.id);
  const role = validRoles.includes(token.role as Role) ? (token.role as Role) : "user";

  return {
    id,
    email: token.email,
    role,
    name: token.name ?? "",
  };
}
