"use client";
import MainContainer from "@/components/MainContainer";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

interface Rule {
  id: number;
  species1_id: string;   // ← string now
  species2_id: string;
  compatible: boolean;
  reason: string | null;
}
interface SpeciesOption {
  id: string;            // ← string now
  name: string;
  type: "fish" | "plant" | "invert";
}

export default function AdminCompatibilityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  /* guards */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any).role)
    ) {
      router.push("/login");
    }
  }, [status, session, router]);

  /* state */
  const [rules, setRules] = useState<Rule[]>([]);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    species1_id: "",
    species2_id: "",
    compatible: true,
    reason: "",
  });

  /* fetch */
  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/admin/compatibility").then(r => r.json()),
      fetch("/api/species").then(r => r.json()),
    ])
      .then(([r, s]) => {
        if (Array.isArray(r)) setRules(r);
        else setError(r.error);
        if (Array.isArray(s)) setSpecies(s);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [status]);

  /* helpers */
  const byId = new Map(species.map(s => [s.id, s.name]));
  const nameFor = (id: string) => byId.get(id) ?? id;

  /* add */
  const addRule = async () => {
    if (!newRule.species1_id || !newRule.species2_id) return alert("Pick species");
    const res = await fetch("/api/admin/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newRule, reason: newRule.reason || null }),
    });
    const data = await res.json();
    if (res.ok) {
      setRules(r => [...r, data]);
      setNewRule({ species1_id: "", species2_id: "", compatible: true, reason: "" });
    } else alert(data.error);
  };

  /* render */
  if (status !== "authenticated") return <div className="p-6">Checking session…</div>;
  const user = {
    id: Number((session!.user as any).id),
    email: session!.user.email ?? "",
    name: session!.user.name ?? "",
    role: (session!.user as any).role,
  };

  return (
    <ClientLayoutWrapper user={user}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-4">Species Compatibility Rules</h1>

        {/* Add new rule */}
        <div className="mb-6 border p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Add New Rule</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <select className="border p-2" value={newRule.species1_id}
              onChange={e => setNewRule({ ...newRule, species1_id: e.target.value })}>
              <option value="">Select Species 1</option>
              {species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select className="border p-2" value={newRule.species2_id}
              onChange={e => setNewRule({ ...newRule, species2_id: e.target.value })}>
              <option value="">Select Species 2</option>
              {species.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select className="border p-2 sm:col-span-2 sm:w-40"
              value={String(newRule.compatible)}
              onChange={e => setNewRule({ ...newRule, compatible: e.target.value === "true" })}>
              <option value="true">Compatible</option>
              <option value="false">Incompatible</option>
            </select>

            <input className="border p-2 sm:col-span-2" placeholder="Reason (optional)"
              value={newRule.reason}
              onChange={e => setNewRule({ ...newRule, reason: e.target.value })}/>
          </div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={addRule}>
            Add Rule
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Species 1</th>
                <th className="border p-2">Species 2</th>
                <th className="border p-2">Compat</th>
                <th className="border p-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td className="border p-2">{r.id}</td>
                  <td className="border p-2">{nameFor(r.species1_id)}</td>
                  <td className="border p-2">{nameFor(r.species2_id)}</td>
                  <td className="border p-2 text-center">{r.compatible ? "✅" : "❌"}</td>
                  <td className="border p-2">{r.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
