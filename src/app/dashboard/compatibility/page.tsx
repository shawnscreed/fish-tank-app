"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import type { Role } from "@/lib/auth";

type Species = {
  id: number;
  name: string;
};

type CompatibilityResult = {
  species1_id: number;
  species2_id: number;
  compatible: boolean | null;
  reason?: string | null;
};

export default function TankCompatibilityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [species, setSpecies] = useState<Species[]>([]);
  const [matrix, setMatrix] = useState<CompatibilityResult[]>([]);

  // 🔐 Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // 🚀 Fetch compatibility matrix
  useEffect(() => {
    if (status !== "authenticated" || !id) return;

    fetch(`/api/tank/${id}/compatibility`)
      .then((res) => res.json())
      .then((data) => {
        if (data.species && data.matrix) {
          setSpecies(data.species);
          setMatrix(data.matrix);
        } else {
          console.warn("Unexpected response:", data);
        }
      })
      .catch((err) => console.error("❌ Compatibility load error:", err));
  }, [id, status]);

  // 🛡️ Guard: loading session
  if (status === "loading") return <div className="p-6">Checking session…</div>;

  // 🛡️ Guard: still redirecting
  if (status === "unauthenticated" || !session?.user)
    return <div className="p-6">Redirecting…</div>;

  const user = {
    id: Number((session.user as any).id),
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as any).role as Role ?? "user",
  };

  // 🧠 Helper to find match result
  const getResult = (a: number, b: number) =>
    matrix.find(
      (m) =>
        (m.species1_id === a && m.species2_id === b) ||
        (m.species1_id === b && m.species2_id === a)
    );

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Compatibility Matrix</h1>

        {species.length === 0 ? (
          <p className="text-gray-500">No species found in this tank.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left">Species</th>
                  {species.map((sp) => (
                    <th key={sp.id} className="border px-2 py-1 text-sm">
                      {sp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {species.map((rowSp) => (
                  <tr key={rowSp.id}>
                    <td className="border px-2 py-1 font-semibold">
                      {rowSp.name}
                    </td>
                    {species.map((colSp) => {
                      if (rowSp.id === colSp.id) {
                        return (
                          <td
                            key={colSp.id}
                            className="border px-2 py-1 text-center text-gray-400"
                          >
                            —
                          </td>
                        );
                      }
                      const result = getResult(rowSp.id, colSp.id);
                      return (
                        <td
                          key={colSp.id}
                          className={`border px-2 py-1 text-center ${
                            result?.compatible === true
                              ? "bg-green-100"
                              : result?.compatible === false
                              ? "bg-red-100"
                              : "bg-gray-100"
                          }`}
                          title={result?.reason || ""}
                        >
                          {result?.compatible === true
                            ? "✔"
                            : result?.compatible === false
                            ? "✖"
                            : "?"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => router.push(`/dashboard/tank/${id}`)}
            className="text-blue-600 hover:underline"
          >
            ← Back to Tank
          </button>
        </div>
      </div>
    </ClientLayoutWrapper>
  );
}
