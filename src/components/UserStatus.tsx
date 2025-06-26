"use client";

import { useSession, signOut } from "next-auth/react";

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
    <div className="text-sm text-gray-700 flex items-center space-x-2">
      <div>
        Logged in as <span className="font-medium">{name || email}</span>
        <span className="ml-1 text-gray-500">({role})</span>
      </div>
      <button
        onClick={() =>
          signOut({
            callbackUrl: `${window.location.origin}/login`, // ✅ dynamic and safe
          })
        }
        className="ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
