// 📄 File: src/components/MobileSidebar.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import type { JWTUser } from "@/lib/auth"; // adjust this type import if needed

interface MenuItem {
  name: string;
  href: string;
}

export default function MobileSidebar({ user }: { user: JWTUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Compatibility", href: "/dashboard/compatibility" },
     { name: "Development Roadmap", href: "/dashboard/roadmap" },
    { name: "Feedback", href: "/dashboard/feedback" },
  ];

  const adminPages: MenuItem[] =
    user.role === "admin" || user.role === "super_admin"
      ? [
          { name: "Fish", href: "/fish" },
          { name: "Plant", href: "/plant" },
          { name: "Inverts", href: "/inverts" },
          { name: "Coral", href: "/coral" },
          { name: "Tank", href: "/tank" },
          { name: "Chemicals", href: "/chemicals" },
        ]
      : [];

  const adminTools: MenuItem[] =
    user.role === "admin" || user.role === "super_admin"
      ? [
          { name: "Access Control", href: "/admin/access-control" },
          { name: "User Accounts", href: "/admin/user-account-manager" },
          { name: "Role Editor", href: "/admin/role-editor" },
          { name: "Referral Codes", href: "/admin/referral-code-manager" },
          { name: "Feedback Entries", href: "/admin/feedback-entry-viewer" },
          { name: "Compatibility", href: "/admin/compatibility" },
        ]
      : [];

  const fullMenu = [...menuItems, ...adminPages, ...adminTools];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setOpen(true)}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {fullMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded hover:bg-gray-100 ${
                pathname === item.href ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
