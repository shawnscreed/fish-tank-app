// 📄 src/app/dashboard/compatibility/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import type { JWTUser, Role } from "@/lib/auth";

interface Tank {
  id: number;
  name: string;
}

export default function DashboardCompatibilityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [tanks, setTanks] = useState<Tank[]>([]);
  const [selectedTankId, setSelectedTankId] = useState<number | null>(null);

  // ───── Auth check ─────
  if (status === "loading") return <div className="p-6">Checking session…</div>;
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const user: JWTUser = {
    id: Number((session.user as any).id),
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as any).role as Role ?? "user",
  };

  // ───── Fetch tanks ─────
  useEffect(() => {
    fetch("/api/tank")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTanks(data);
        }
      })
      .catch(() => console.error("Failed to load tanks"));
  }, []);

  // ───── Handle selection → redirect ─────
  const handleTankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tankId = Number(e.target.value);
    if (tankId) {
      router.push(`/dashboard/tank/${tankId}/compatibility`);
    }
  };

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Choose a Tank</h1>
        <p className="mb-4 text-gray-600">Check compatibility for the fish in a specific tank.</p>

        {tanks.length > 0 ? (
          <select
            className="border p-2 rounded w-full"
            defaultValue=""
            onChange={handleTankSelect}
          >
            <option value="" disabled>
              Select a tank to check compatibility...
            </option>
            {tanks.map((tank) => (
              <option key={tank.id} value={tank.id}>
                {tank.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500">No tanks found.</p>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
