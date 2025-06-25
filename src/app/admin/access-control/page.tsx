"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { useRouter } from "next/navigation";
import { JWTUser } from "@/lib/auth";

interface AccessRule {
  id: number;
  page_route: string;
  required_levels: string[];
}

interface User {
  id: number;
  name?: string;
  email: string;
  paid_level: string;
  role?: string;
}

export default function AccessControlPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const currentUser: JWTUser | null = useMemo(() => {
    if (!session?.user?.id || !session?.user?.email) return null;
    return {
      id: Number((session.user as any).id),
      email: session.user.email,
      name: session.user.name || "",
      role: (session.user as any).role,
    };
  }, [session]);

  const [rules, setRules] = useState<AccessRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [paidLevels, setPaidLevels] = useState<string[]>([]);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editedLevelName, setEditedLevelName] = useState("");
  const [newLevel, setNewLevel] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      rescanPages();
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (!currentUser) return <p>Not logged in</p>;

  const fetchData = async () => {
    try {
      const [rulesRes, levelsRes] = await Promise.all([
        fetch("/api/admin/access-control"),
        fetch("/api/admin/access-control/levels"),
      ]);

      const rulesData = await rulesRes.json();
      const levelsData = await levelsRes.json();

      setRules(rulesData.rules || []);
      setUsers(rulesData.users || []);
      setPaidLevels(levelsData.levels || []);
    } catch (err) {
      console.error("❌ Failed to fetch access data:", err);
    }
  };

  const rescanPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/access-control/rescan", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Rescan failed");
      await fetchData();
      console.log("🔄 Pages and levels rescanned.");
    } catch (err) {
      console.error("Error rescanning pages:", err);
      alert("Failed to rescan pages.");
    } finally {
      setLoading(false);
    }
  };

  const updateAccess = async (route: string, levels: string[]) => {
    try {
      const res = await fetch("/api/admin/access-control", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_route: route, required_levels: levels }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      console.log("✅ Access updated", json.updated);
      setRules((prev) =>
        prev.map((r) =>
          r.page_route === route ? { ...r, required_levels: levels } : r
        )
      );
    } catch (err) {
      console.error("Failed to update access rule:", err);
      alert("Error saving access rule.");
    }
  };

  const updateUserLevel = async (userId: number, level: string) => {
    try {
      const res = await fetch(`/api/admin/access-control/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid_level: level }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      console.log("✅ User level updated", json.updated);
    } catch (err) {
      console.error("Failed to update user level:", err);
      alert("Error saving user level.");
    }
  };

  const toggleLevel = (route: string, level: string, checked: boolean) => {
    const rule = rules.find((r) => r.page_route === route);
    if (!rule) return;

    const normLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

    const newLevels = checked
      ? [...new Set([...rule.required_levels, normLevel])]
      : rule.required_levels.filter((lvl) => lvl !== normLevel);

    updateAccess(route, newLevels);
  };

  const addLevel = async () => {
    if (!newLevel.trim()) return;
    try {
      const res = await fetch("/api/admin/access-control/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      });
      if (res.ok) {
        setNewLevel("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add level", err);
    }
  };

  const deleteLevel = async (level: string) => {
    try {
      const res = await fetch(`/api/admin/access-control/levels/${level}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete level", err);
    }
  };

  const renameLevel = async (oldLevel: string, newLevel: string) => {
    try {
      const res = await fetch(`/api/admin/access-control/levels/${oldLevel}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_level: newLevel }),
      });
      if (res.ok) {
        setEditingLevel(null);
        setEditedLevelName("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to rename level", err);
    }
  };

  return (
    <ClientLayoutWrapper user={currentUser}>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">🔐 Access Control Panel</h1>
        <p className="text-sm text-gray-500 mb-4">
          Logged in as <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.role})
        </p>

        {/* Membership Levels */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Membership Levels</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              placeholder="New level name"
              className="border px-2 py-1"
            />
            <button
              onClick={addLevel}
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              ➕ Add Level
            </button>
          </div>
          <ul className="flex gap-4 flex-wrap">
            {paidLevels.map((lvl) => (
              <li
                key={lvl}
                className="bg-gray-100 px-3 py-1 rounded border flex items-center gap-2"
              >
                {editingLevel === lvl ? (
                  <>
                    <input
                      type="text"
                      className="border px-2 py-1 text-sm"
                      value={editedLevelName}
                      onChange={(e) => setEditedLevelName(e.target.value)}
                    />
                    <button
                      className="text-green-600 text-sm"
                      onClick={() => renameLevel(lvl, editedLevelName)}
                    >✔</button>
                    <button
                      className="text-gray-500 text-sm"
                      onClick={() => setEditingLevel(null)}
                    >✖</button>
                  </>
                ) : (
                  <>
                    {lvl}
                    <button
                      className="text-blue-600 text-sm"
                      onClick={() => {
                        setEditingLevel(lvl);
                        setEditedLevelName(lvl);
                      }}
                    >✎</button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteLevel(lvl)}
                    >✖</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Page Rules Section */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mt-6 mb-2">Page Access Rules</h2>
          <button
            onClick={rescanPages}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded shadow disabled:opacity-50"
            disabled={loading}
          >
            🔄 {loading ? "Scanning..." : "Rescan Pages"}
          </button>
        </div>

        {rules.length === 0 ? (
          <p className="text-gray-500 mb-4">No access rules defined yet.</p>
        ) : (
          <table className="w-full border mb-8 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Page Route</th>
                {paidLevels.map((lvl) => (
                  <th key={lvl} className="border p-2 text-center">
                    {lvl}
                  </th>
                ))}
                <th className="border p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="border p-2 font-mono">{rule.page_route}</td>
                  {paidLevels.map((lvl) => (
                    <td key={lvl} className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={rule.required_levels.includes(lvl)}
                        onChange={(e) =>
                          toggleLevel(rule.page_route, lvl, e.target.checked)
                        }
                      />
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    {rule.required_levels.length === 0 ? (
                      <span className="text-gray-500 italic">None Assigned</span>
                    ) : (
                      <span className="text-green-600">✅</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 className="text-xl font-semibold mb-2">Users & Access Levels</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Paid Level</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">{u.name || "Unnamed"}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">
                  <select
                    className="border px-2 py-1"
                    value={u.paid_level}
                    onChange={(e) => updateUserLevel(u.id, e.target.value)}
                  >
                    {paidLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ClientLayoutWrapper>
  );
}
