// 📄 Page: /admin/feedback-entry-viewer/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { JWTUser } from "@/lib/auth";

interface FeedbackEntry {
  id: number;
  name?: string;
  email?: string;
  message: string;
  created_at: string;
  tank_id?: number;
}

export default function AdminFeedbackEntryViewerPage() {
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

  const [data, setData] = useState<FeedbackEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/feedback-entry-viewer")
        .then((res) => res.json())
        .then((json) => {
          const entries = Array.isArray(json) ? json : json.data;
          if (Array.isArray(entries)) {
            const sorted = entries.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setData(sorted);
          } else {
            setError("Unexpected response format.");
          }
        })
        .catch((err) => {
          console.error("Failed to load feedback:", err);
          setError("Failed to load feedback.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [status]);

  const filteredData = data.filter(
    (entry) =>
      entry.message.toLowerCase().includes(filter.toLowerCase()) ||
      entry.email?.toLowerCase().includes(filter.toLowerCase())
  );

  if (status === "loading" || !currentUser) {
    return (
      <ClientLayoutWrapper user={currentUser || { id: 0, email: "", role: "user", name: "" }}>
        <div className="p-6 text-gray-500">Checking session...</div>
      </ClientLayoutWrapper>
    );
  }

  return (
    <ClientLayoutWrapper user={currentUser}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin – Feedback Viewer</h1>

        <input
          type="text"
          placeholder="🔍 Filter by message or email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-4 p-2 border rounded w-full max-w-md"
        />

        {loading ? (
          <p className="text-gray-500">Loading feedback...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-600">No feedback found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded shadow text-sm">
              <thead>
                <tr className="bg-gray-100 text-left font-semibold">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Feedback</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Tank</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{entry.name || "Anonymous"}</td>
                    <td className="p-2 border">{entry.email || "N/A"}</td>
                    <td className="p-2 border max-w-xs whitespace-pre-wrap">{entry.message}</td>
                    <td className="p-2 border">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="p-2 border">
                      {entry.tank_id ? (
                        <a
                          href={`/dashboard/tank/${entry.tank_id}`}
                          className="text-blue-600 underline"
                        >
                          View Tank
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
