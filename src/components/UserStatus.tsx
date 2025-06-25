"use client";

import { useEffect, useState } from "react";
import { getUserFromClientCookies, JWTUser } from "@/lib/auth";

export default function UserStatus() {
  const [user, setUser] = useState<JWTUser | null>(null);

  useEffect(() => {
    getUserFromClientCookies().then(setUser);
  }, []);

  if (!user) {
    return <p className="text-red-600">Not logged in</p>;
  }

  return (
    <p className="text-green-600">
      Logged in as <strong>{user.name || user.email}</strong> ({user.role})
    </p>
  );
}
