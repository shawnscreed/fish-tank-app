// 📄 Page: /admin/feedback-entry-viewer/page.tsx

"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/app/ClientLayout";

interface FeedbackEntry {
  id: number;
  name?: string;
  email?: string;
  message: string;
  created_at: string;
}

export default function AdminFeedbackEntryViewerPage() {
  const [data, setData] = useState<FeedbackEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/feedback-entry-viewer")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else if (Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setError("Unexpected response format.");
        }
      })
      .catch((err) => {
        console.error("Failed to load feedback:", err);
        setError("Failed to load feedback.");
      });
  }, []);

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin – Feedback Viewer</h1>

        {error && <p className="text-red-600">{error}</p>}

        {!error && data.length === 0 ? (
          <p className="text-gray-600">No feedback found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded shadow">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Feedback</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry) => (
                  <tr key={entry.id} className="text-sm hover:bg-gray-50">
                    <td className="p-2 border">{entry.name || "Anonymous"}</td>
                    <td className="p-2 border">{entry.email || "N/A"}</td>
                    <td className="p-2 border whitespace-pre-wrap">
                      {entry.message}
                    </td>
                    <td className="p-2 border">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
