// src/app/ClientLayout.tsx
"use client";
import Link from "next/link";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {

type MenuItem = {
  name: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/" },
  { name: "Fish", href: "/fish" },
  { name: "Plant", href: "/plant" },
  { name: "Coral", href: "/coral" },
  { name: "Inverts", href: "/inverts" },
  { name: "Tank", href: "/tank" },
  { name: "Work", href: "/work" },
];


  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Menu</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-blue-600 hover:underline">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
