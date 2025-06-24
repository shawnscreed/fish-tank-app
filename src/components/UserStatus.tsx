// 📁 File: src/components/UserStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { getUserFromClientCookies, JWTUser } from "@/lib/auth";

export default function UserStatus() {
  const [user, setUser] = useState<JWTUser | null>(null); // ✅ Explicit typing

  useEffect(() => {
    getUserFromClientCookies().then((user) => setUser(user));
  }, []);

  if (!user) {
    return <p className="text-red-600 text-sm">Not logged in</p>;
  }

  return (
    <p className="text-green-700 text-sm">
      Logged in as <strong>{user.name || user.email}</strong> ({user.role})
    </p>
  );
}
