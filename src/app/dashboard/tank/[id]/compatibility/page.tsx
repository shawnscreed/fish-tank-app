
// file: src/app/dashboard/tank/[id]/compatibility/page.tsx

"use client";
import MainContainer from "@/components/MainContainer";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Link from "next/link";
import type { Role } from "@/lib/auth";

/* ───────────────── types ───────────────── */
interface Species {
  id: string; // ✅ was `number`, now string (e.g. "fish-3")
  name: string;
  type: "fish" | "plant" | "invert";
  ph_low: number | null;
  ph_high: number | null;
  temp_low: number | null;
  temp_high: number | null;
}
interface MatrixEntry {
  species1_id: string;
  species2_id: string;
  compatible: boolean | null;
  reason?: string | null;
}
interface ApiResponse {
  species: Species[];
  matrix: MatrixEntry[];
  tankParams?: { ph: number | null; temp: number | null };
}

/* ───────────────── component ───────────────── */
export default function CompatibilityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!id || status !== "authenticated") return;

    fetch(`/api/tank/${id}/compatibility`)
      .then(async (res) => {
        if (res.status === 403 || res.status === 404) {
          router.push("/dashboard");
          return null;
        }
        return res.json();
      })
      .then((json) => json && setData(json))
      .catch(() => setError("Failed to load compatibility data."));
  }, [id, status, router]);

  if (status === "loading") return <div className="p-6">Checking session…</div>;
  if (!session?.user) return <div className="p-6">Redirecting…</div>;

  const user = {
    id: Number((session.user as any).id),
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: (session.user as any).role as Role,
  };

 const matrixMap = useMemo(() => {
  const m = new Map<string, MatrixEntry>();

  if (Array.isArray(data?.matrix)) {
    data.matrix.forEach((e) => {
      if (e?.species1_id && e?.species2_id) {
        m.set(`${e.species1_id}-${e.species2_id}`, e);
      }
    });
  }

  return m;
}, [data]);


  const overlap = (
    aLow: number | null,
    aHigh: number | null,
    bLow: number | null,
    bHigh: number | null
  ) => {
    if (aLow == null || aHigh == null || bLow == null || bHigh == null) return true;
    return aLow <= bHigh && bLow <= aHigh;
  };

  const headerBg = (sp: Species) => {
    const { species } = data ?? { species: [] };
    const anyConflict = species.some((other) =>
      !overlap(sp.ph_low, sp.ph_high, other.ph_low, other.ph_high)
    );
    return anyConflict ? "bg-red-100" : "bg-green-100";
  };

  const renderCell = (i: number, j: number) => {
    if (!data) return null;
    if (i === j) return <td className="bg-gray-100" />;

    const id1 = data.species[i].id;
    const id2 = data.species[j].id;
    const entry =
      matrixMap.get(`${id1}-${id2}`) ?? matrixMap.get(`${id2}-${id1}`);

    let bg = "bg-gray-300";
    let symbol = "?";
    if (entry) {
      bg = entry.compatible ? "bg-green-200" : "bg-red-300";
      symbol = entry.compatible ? "✓" : "✕";
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

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-2">Compatibility Checker</h1>
        <p className="text-gray-600 mb-4">
          Fish, plants & inverts compatibility matrix. Header colours flag pH / temperature range overlaps.
        </p>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : !data ? (
          <p className="text-gray-500">Loading compatibility data…</p>
        ) : data.species.length < 2 ? (
          <p className="italic text-gray-500">Add at least two species to run the checker.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="border text-xs">
              <thead>
                <tr>
                  <th className="border px-2 py-1 bg-gray-100 sticky left-0 z-10">Species</th>
                  {data.species.map((s) => (
                    <th key={s.id} className={`border px-2 py-1 ${headerBg(s)}`}>{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.species.map((row, i) => (
                  <tr key={row.id}>
                    <th className={`border px-2 py-1 sticky left-0 z-10 ${headerBg(row)}`}>{row.name}</th>
                    {data.species.map((_, j) => renderCell(i, j))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-gray-600">
              ✓ compatible • ✕ incompatible • ? no data
            </p>
          </div>
        )}

        <Link href={`/dashboard/tank/${id}`} className="mt-8 inline-block text-blue-600 hover:underline">
          ← Back to Tank
        </Link>
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
