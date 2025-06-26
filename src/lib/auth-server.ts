// 📄 File: src/lib/auth-server.ts

import { getServerSession } from "next-auth";
import { authOptions } from "./serverAuthOptions";
import { redirect } from "next/navigation";

export type Role = "user" | "admin" | "super_admin" | "sub_admin" | "beta_user";

export interface JWTUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

const validRoles: Role[] = ["user", "admin", "super_admin", "sub_admin", "beta_user"];

export async function getUserFromServer(): Promise<JWTUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.id || !session.user.email) {
    console.warn("🔒 No valid session found – redirecting");
    redirect("/login");
  }

  const id = Number(session.user.id);
  const role = validRoles.includes(session.user.role as Role)
    ? (session.user.role as Role)
    : "user";

  return {
    id,
    email: session.user.email,
    role,
    name: session.user.name ?? "",
  };
}
