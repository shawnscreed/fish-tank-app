"use client";

import { useSession } from "next-auth/react";

export default function UserStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="text-gray-500">Loading...</p>;
  if (!session?.user) return <p className="text-red-600">Not logged in</p>;

  const { name, email, role } = session.user as {
    name?: string;
    email?: string;
    role?: string;
  };

  return (
    <div className="text-sm text-gray-700">
      Logged in as <span className="font-medium">{name || email}</span>
      <span className="ml-1 text-gray-500">({role})</span>
    </div>
  );
}
