"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

/* ─────────────── types ─────────────── */
interface Rule {
  id: number;
  species1_id: number;
  species2_id: number;
  compatible: boolean;
  reason: string | null;
}
interface SpeciesOption {
  id: number;
  name: string;
  type: "fish" | "plant" | "invert";
}

export default function AdminCompatibilityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [rules, setRules] = useState<Rule[]>([]);
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [newRule, setNewRule] = useState({
    species1_id: "",
    species2_id: "",
    compatible: true,
    reason: "",
  });
  const [editor, setEditor] = useState<{
    open: boolean;
    species1_id: number;
    species2_id: number;
    compatible: boolean;
    reason: string;
    ruleId?: number;
  }>({ open: false } as any);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/admin/compatibility").then((r) => r.json()),
      fetch("/api/species").then((r) => r.json()),
    ])
      .then(([rulesRes, speciesRes]) => {
        if (Array.isArray(rulesRes)) setRules(rulesRes);
        else setError(rulesRes.error);
        if (Array.isArray(speciesRes)) setSpecies(speciesRes);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [status]);

  const handleAdd = async () => {
    const { species1_id, species2_id } = newRule;
    if (!species1_id || !species2_id) return alert("Choose both species");
    const res = await fetch("/api/admin/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        species1_id: Number(species1_id),
        species2_id: Number(species2_id),
        compatible: newRule.compatible,
        reason: newRule.reason || null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setRules((prev) => [...prev, data]);
      setNewRule({ species1_id: "", species2_id: "", compatible: true, reason: "" });
    } else alert(data.error);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this rule?")) return;
    const res = await fetch(`/api/admin/compatibility/${id}`, { method: "DELETE" });
    if (res.ok) setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const nameFor = (id: number) => species.find((s) => s.id === id)?.name ?? id;

  const openEditor = (opts: { rule: Rule | null; species1_id: number; species2_id: number }) => {
    const { rule, species1_id, species2_id } = opts;
    setEditor({
      open: true,
      species1_id,
      species2_id,
      compatible: rule?.compatible ?? true,
      reason: rule?.reason ?? "",
      ruleId: rule?.id,
    });
  };

  const saveEditor = async () => {
    const method = editor.ruleId ? "PUT" : "POST";
    const url = editor.ruleId
      ? `/api/admin/compatibility/${editor.ruleId}`
      : "/api/admin/compatibility";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        species1_id: editor.species1_id,
        species2_id: editor.species2_id,
        compatible: editor.compatible,
        reason: editor.reason || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Save failed");

    setRules((prev) => {
      const without = prev.filter((r) => r.id !== (editor.ruleId ?? data.id));
      return [...without, data];
    });
    setEditor({ open: false } as any);
  };

  if (status !== "authenticated") return <div className="p-6">Checking session…</div>;

  const user = {
    id: Number((session!.user as any).id),
    email: session!.user.email ?? "",
    name: session!.user.name ?? "",
    role: (session!.user as any).role,
  };

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Species Compatibility Rules</h1>

        <button
          className="mb-4 bg-gray-200 px-3 py-1 rounded"
          onClick={() => setShowMatrix(!showMatrix)}
        >
          {showMatrix ? "🔄 Switch to Table View" : "🗺️ Switch to Matrix View"}
        </button>

        {/* MATRIX VIEW */}
        {showMatrix && (
          <div className="overflow-x-auto mb-8">
            <table className="border text-xs">
              <thead>
                <tr>
                  <th className="border px-2 py-1 bg-gray-100 sticky left-0 z-10">Species</th>
                  {species.map((s) => (
                    <th key={s.id} className="border px-2 py-1 bg-gray-100">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {species.map((row) => (
                  <tr key={row.id}>
                    <th className="border px-2 py-1 bg-gray-100 sticky left-0 z-10">{row.name}</th>
                    {species.map((col) => {
                      if (row.id === col.id)
                        return <td key={col.id} className="border bg-gray-50" />;

                      const rule =
                        rules.find(
                          (r) =>
                            (r.species1_id === row.id && r.species2_id === col.id) ||
                            (r.species1_id === col.id && r.species2_id === row.id)
                        ) ?? null;

                      const bg = rule
                        ? rule.compatible
                          ? "bg-green-200"
                          : "bg-red-200"
                        : "bg-gray-200";

                      return (
                        <td
                          key={col.id}
                          className={`${bg} border w-8 h-8 cursor-pointer group`}
                          title={rule ? rule.reason || "No reason" : "No rule (click to add)"}
                          onClick={() =>
                            openEditor({ rule, species1_id: row.id, species2_id: col.id })
                          }
                        >
                          <span className="invisible group-hover:visible">
                            {rule ? (rule.compatible ? "✓" : "✕") : "＋"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE VIEW + ADD FORM */}
        {!showMatrix && (
          <>
            <div className="mb-6 border p-4 rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Add New Rule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  className="border p-2"
                  value={newRule.species1_id}
                  onChange={(e) => setNewRule({ ...newRule, species1_id: e.target.value })}
                >
                  <option value="">Select Species 1</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  className="border p-2"
                  value={newRule.species2_id}
                  onChange={(e) => setNewRule({ ...newRule, species2_id: e.target.value })}
                >
                  <option value="">Select Species 2</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  className="border p-2"
                  value={newRule.compatible ? "true" : "false"}
                  onChange={(e) =>
                    setNewRule({ ...newRule, compatible: e.target.value === "true" })
                  }
                >
                  <option value="true">Compatible</option>
                  <option value="false">Incompatible</option>
                </select>
                <input
                  className="border p-2"
                  placeholder="Reason (optional)"
                  value={newRule.reason}
                  onChange={(e) => setNewRule({ ...newRule, reason: e.target.value })}
                />
              </div>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAdd}
              >
                Add Rule
              </button>
            </div>

            {loading ? (
              <p>Loading…</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <div className="overflow-x-auto border rounded shadow">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Species 1</th>
                      <th className="border p-2">Species 2</th>
                      <th className="border p-2">Compat</th>
                      <th className="border p-2">Reason</th>
                      <th className="border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="border p-2">{r.id}</td>
                        <td className="border p-2">{nameFor(r.species1_id)}</td>
                        <td className="border p-2">{nameFor(r.species2_id)}</td>
                        <td className="border p-2 text-center">{r.compatible ? "✅" : "❌"}</td>
                        <td className="border p-2">{r.reason ?? "—"}</td>
                        <td className="border p-2 text-center">
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* MODAL EDITOR */}
        {editor.open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full">
              <h2 className="font-semibold mb-4">
                {nameFor(editor.species1_id)} &amp; {nameFor(editor.species2_id)}
              </h2>
              <select
                className="border w-full mb-3 p-2"
                value={editor.compatible ? "true" : "false"}
                onChange={(e) =>
                  setEditor({ ...editor, compatible: e.target.value === "true" })
                }
              >
                <option value="true">Compatible</option>
                <option value="false">Incompatible</option>
              </select>
              <input
                className="border w-full mb-4 p-2"
                placeholder="Reason (optional)"
                value={editor.reason}
                onChange={(e) => setEditor({ ...editor, reason: e.target.value })}
              />
              <div className="flex justify-end gap-3">
                <button className="px-3 py-1" onClick={() => setEditor({ open: false } as any)}>
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={saveEditor}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
