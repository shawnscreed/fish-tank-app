// 📄 File: src/components/ClientLayoutWrapper.tsx

"use client"; // ✅ Make this a client component

import { ReactNode } from "react";
import ClientLayout from "./ClientLayout";
import { JWTUser } from "@/lib/auth";

interface Props {
  user: JWTUser;
  children: ReactNode;
}

export default function ClientLayoutWrapper({ user, children }: Props) {
  return <ClientLayout user={user}>{children}</ClientLayout>;
}
