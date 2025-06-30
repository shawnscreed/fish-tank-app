"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import MainContainer from "@/components/MainContainer";
import { useSession } from "next-auth/react";
import type { JWTUser, Role } from "@/lib/auth";

type Species = {
  id: number;
  name: string;
  type: "fish" | "plant" | "invert" | "coral";
  ph_low?: number;
  ph_high?: number;
  temp_low?: number;
  temp_high?: number;
  hardness_low?: number;
  hardness_high?: number;
};

export default function StockingSuggestionsPage() {
  const { id: tankId } = useParams();
  const { data: session, status } = useSession();

  const [suggestions, setSuggestions] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Only fetch if session is available
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setMessage("You must be logged in to view suggestions.");
      setLoading(false);
      return;
    }

    async function fetchSuggestions() {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(`/api/tanks/${tankId}/stocking-suggestions`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Species[] = await res.json();
        setSuggestions(data);
      } catch (e) {
        console.error(e);
        setSuggestions([]);
        setMessage("Failed to load suggestions.");
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, [tankId, session, status]);

  const addToTank = async (speciesId: number, type: string) => {
    if (!session) {
      setMessage("You must be logged in to add species.");
      return;
    }

    setAddingId(speciesId);
    setMessage(null);
    const routeMap: Record<string, string> = {
      fish: "/api/tankfish",
      plant: "/api/tankplant",
      invert: "/api/tankinverts",
      coral: "/api/tankcoral",
    };
    const route = routeMap[type];
    if (!route) {
      setMessage("Invalid species type");
      setAddingId(null);
      return;
    }

    try {
      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tank_id: tankId, [`${type}_id`]: speciesId }),
      });
      if (!res.ok) throw new Error("Failed to add species");

      setMessage(`Added ${type} successfully!`);

      // Refresh suggestions list after adding
      const refreshed = await fetch(`/api/tanks/${tankId}/stocking-suggestions`);
      const data: Species[] = await refreshed.json();
      setSuggestions(data);
    } catch (e) {
      setMessage("Failed to add species. Try again.");
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  // If session is null or undefined, pass a fallback user with minimal required fields and valid role
  const userForLayout: JWTUser = session?.user
    ? {
        id: Number(session.user.id),
        email: session.user.email ?? "",
        role: (session.user.role ?? "user") as Role,
        name: session.user.name ?? undefined,
      }
    : {
        id: 0,
        email: "",
        role: "user",
      };

  if (status === "loading") {
    return (
      <ClientLayoutWrapper user={userForLayout}>
        <MainContainer>
          <p>Loading session...</p>
        </MainContainer>
      </ClientLayoutWrapper>
    );
  }

  if (!session) {
    return (
      <ClientLayoutWrapper user={userForLayout}>
        <MainContainer>
          <p className="text-red-600">You must be logged in to view this page.</p>
        </MainContainer>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper user={userForLayout}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-6">Stocking Suggestions</h1>

        {loading && <p>Loading stocking suggestions...</p>}

        {!loading && suggestions.length === 0 && (
          <div>
            <p>No stocking suggestions available for this tank.</p>
            {message && <p className="text-red-600 mt-2">{message}</p>}
          </div>
        )}

        {message && !loading && (
          <p className="text-green-600 font-semibold mb-4">{message}</p>
        )}

        {!loading && suggestions.length > 0 && (
          <>
            {Object.entries(
              suggestions.reduce<Record<string, Species[]>>((acc, s) => {
                acc[s.type] = acc[s.type] ?? [];
                acc[s.type].push(s);
                return acc;
              }, {})
            ).map(([type, speciesList]) => (
              <section key={type} className="mb-8">
                <h2 className="text-xl font-semibold capitalize mb-4">{type}s</h2>
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">pH Range</th>
                      <th className="border px-2 py-1">Temp Range</th>
                      <th className="border px-2 py-1">Hardness Range</th>
                      <th className="border px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {speciesList.map((s) => (
                      <tr key={s.id}>
                        <td className="border px-2 py-1">{s.name}</td>
                        <td className="border px-2 py-1">
                          {s.ph_low ?? "N/A"}–{s.ph_high ?? "N/A"}
                        </td>
                        <td className="border px-2 py-1">
                          {s.temp_low ?? "N/A"}–{s.temp_high ?? "N/A"}
                        </td>
                        <td className="border px-2 py-1">
                          {s.hardness_low ?? "N/A"}–{s.hardness_high ?? "N/A"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            onClick={() => addToTank(s.id, s.type)}
                            disabled={addingId === s.id}
                            className={`px-3 py-1 rounded text-white ${
                              addingId === s.id
                                ? "bg-gray-400"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {addingId === s.id ? "Adding..." : "Add to Tank"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </>
        )}
      </MainContainer>
    </ClientLayoutWrapper>
  );
}
