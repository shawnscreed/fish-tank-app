"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Link from "next/link";
import type { Role } from "@/lib/auth";

type Species = {
  id: number;
  name: string;
  type: "fish";
};

type MatrixEntry = {
  species1_id: number;
  species2_id: number;
  compatible: boolean | null; // null = unknown
  reason?: string | null;
};

type ApiResponse = { species: Species[]; matrix: MatrixEntry[] };

export default function CompatibilityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [data,   setData]   = useState<ApiResponse | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  /* ───────────────────────── auth guard ───────────────────────── */
  if (status === "loading") return <div className="p-6">Checking session…</div>;
  if (status === "unauthenticated" || !session?.user) {
    router.push("/login");
    return null;
  }

  const user = {
    id:   Number((session.user as any).id),
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: (session.user as any).role as Role ?? "user",
  };

  /* ───────────────────────── fetch data ───────────────────────── */
  useEffect(() => {
    if (!id) return;
    fetch(`/api/tank/${id}/compatibility`)
      .then(async (res) => {
        if (res.status === 403 || res.status === 404) {
          router.push("/dashboard");         // unauthorized tank
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load compatibility data.");
      });
  }, [id, router]);

  /* ───────────────────────── helpers ──────────────────────────── */
  const matrixMap = new Map<string, MatrixEntry>();
  data?.matrix.forEach((m) =>
    matrixMap.set(`${m.species1_id}-${m.species2_id}`, m)
  );

  const renderCell = (i: number, j: number) => {
    if (!data) return null;
    if (i === j) return <td className="bg-gray-100" />;

    const id1 = data.species[i].id;
    const id2 = data.species[j].id;
    const entry = matrixMap.get(`${id1}-${id2}`) ?? matrixMap.get(`${id2}-${id1}`);

    let bg = "bg-gray-300";
    let symbol = " ?";
    if (entry) {
      if (entry.compatible === true) {
        bg = "bg-green-200";
        symbol = " ✓";
      } else if (entry.compatible === false) {
        bg = "bg-red-300";
        symbol = " ✕";
      }
    }

    return (
      <td
        key={`${id1}-${id2}`}
        className={`${bg} text-center text-sm px-3 py-2 cursor-help`}
        title={entry?.reason ?? "No rule in database"}
      >
        {symbol}
      </td>
    );
  };

  /* ───────────────────────── render ───────────────────────────── */
  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Compatibility Checker</h1>
        <p className="text-gray-600 mb-4">
          Quickly see if your tank’s inhabitants are compatible.
        </p>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : !data ? (
          <p className="text-gray-500">Loading compatibility data…</p>
        ) : data.species.length < 2 ? (
          <p className="italic text-gray-500">
            Add at least two species to this tank to run compatibility check.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="border text-sm">
              <thead>
                <tr>
                  <th className="border px-3 py-2 bg-gray-100">Species</th>
                  {data.species.map((s) => (
                    <th key={s.id} className="border px-3 py-2 bg-gray-100">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.species.map((row, i) => (
                  <tr key={row.id}>
                    <th className="border px-3 py-2 bg-gray-100">{row.name}</th>
                    {data.species.map((_, j) => renderCell(i, j))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-gray-600">
              ✓ compatible&nbsp;&nbsp;•&nbsp;&nbsp;✕ incompatible&nbsp;&nbsp;•&nbsp;&nbsp;? no data
            </p>
          </div>
        )}

        <Link
          href={`/dashboard/tank/${id}`}
          className="mt-8 inline-block text-blue-600 hover:underline"
        >
          ← Back to Tank
        </Link>
      </div>
    </ClientLayoutWrapper>
  );
}
