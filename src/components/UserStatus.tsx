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
  <div className="text-sm text-gray-700">
    Logged in as <span className="font-medium">{user.name || user.email}</span>
    <span className="ml-1 text-gray-500">({user.role})</span>
  </div>
);
}
