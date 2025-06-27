"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Link from "next/link";

type Tank = { id: number; name: string };

export default function CompatibilityHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 🔐 redirect guests
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // 📥 load user’s tanks
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/tank") // ← must return { id, name } for current user
      .then((r) => r.json())
      .then(setTanks)
      .catch(() => setError("Could not load tanks"));
  }, [status]);

  if (status === "loading") return <div className="p-6">Checking session…</div>;
  if (!session?.user) return <div className="p-6">Redirecting…</div>;

  const user = session.user as any;

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Compatibility Checker</h1>
        <p className="text-gray-600 mb-6">
          Pick a tank to view its species compatibility matrix.
        </p>

        {error && <p className="text-red-600">{error}</p>}

        {tanks.length === 0 ? (
          <p className="italic text-gray-500">You have no tanks yet.</p>
        ) : (
          <ul className="space-y-2">
            {tanks.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/tank/${t.id}/compatibility`}
                  className="text-blue-600 underline"
                >
                  🧪 {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
