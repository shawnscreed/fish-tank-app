// 📁 File: src/app/ClientLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";

interface MenuItem {
  name: string;
  href: string;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user;

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Coral", href: "/coral" },
    { name: "Tank", href: "/tank" },
    { name: "Work", href: "/work" },
    { name: "Chemicals", href: "/chemicals" },
    { name: "Feedback", href: "/dashboard/feedback" },
  ];

  const adminPages: MenuItem[] =
    user?.role === "admin" || user?.role === "super_admin"
      ? [
          { name: "Fish", href: "/fish" },
          { name: "Plant", href: "/plant" },
          { name: "Inverts", href: "/inverts" },
        ]
      : [];

  const adminTools: MenuItem[] =
    user?.role === "admin" || user?.role === "super_admin"
      ? [
          { name: "Access Control", href: "/admin/access-control" },
          { name: "User Accounts", href: "/admin/user-account-manager" },
          { name: "Role Editor", href: "/admin/role-editor" },
          { name: "Referral Codes", href: "/admin/referral-code-manager" },
          { name: "Feedback Entries", href: "/admin/feedback-entry-viewer" },
        ]
      : [];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-blue-600 hover:underline">
                  {item.name}
                </Link>
              </li>
            ))}

            {adminPages.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">Admin Pages</li>
                {adminPages.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-blue-700 hover:underline">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}

            {adminTools.length > 0 && (
              <>
                <li className="mt-4 text-sm text-gray-500 uppercase">Admin Tools</li>
                {adminTools.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-purple-700 hover:underline">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          {user ? (
            <>
              <p className="mb-1">
                Logged in as <strong>{user.name || user.email}</strong>
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <p className="text-gray-500">Not logged in</p>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
