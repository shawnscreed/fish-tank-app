"use client";

import MainContainer from "@/components/MainContainer";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tank {
  id: number;
  name: string;
  water_type: string;
  gallons: number;
}

interface WaterLog {
  id: number;
  tank_id: number;
  created_at: string;
  ph: number;
  hardness: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  salinity?: number;
  notes?: string;
}

export default function WaterLogPage({
  userId,
  tankId,
}: {
  userId: number;
  tankId: number;
}) {
  const [tank, setTank] = useState<Tank | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [form, setForm] = useState({
    ph: "",
    hardness: "",
    ammonia: "",
    nitrite: "",
    nitrate: "",
    salinity: "",
    notes: "",
  });

  const [editingLog, setEditingLog] = useState<null | number>(null);
  const [editForm, setEditForm] = useState<Partial<WaterLog>>({});

  useEffect(() => {
    if (!tankId || !userId) return;

    fetch(`/api/tanks/${tankId}?user_id=${userId}`)
      .then((res) => res.json())
      .then(setTank)
      .catch(() => setTank(null));

    fetch(`/api/tanks/${tankId}/water`)
      .then((res) => res.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []));
  }, [tankId, userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/tanks/${tankId}/water`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ph: parseFloat(form.ph) || null,
        hardness: parseFloat(form.hardness) || null,
        ammonia: parseFloat(form.ammonia) || null,
        nitrite: parseFloat(form.nitrite) || null,
        nitrate: parseFloat(form.nitrate) || null,
        salinity: form.salinity ? parseFloat(form.salinity) : undefined,
        notes: form.notes || undefined,
      }),
    });

    if (res.ok) {
      const newLog = await res.json();
      setLogs((prev) => [newLog, ...prev]);
      setForm({
        ph: "",
        hardness: "",
        ammonia: "",
        nitrite: "",
        nitrate: "",
        salinity: "",
        notes: "",
      });
    } else {
      console.error("❌ Failed to submit log");
    }
  };

  const handleSaveEdit = async (logId: number) => {
    const res = await fetch(`/api/tanks/${tankId}/water/${logId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      const updated = await res.json();
      setLogs((prev) => prev.map((log) => (log.id === logId ? updated : log)));
      setEditingLog(null);
      setEditForm({});
    } else {
      console.error("❌ Failed to update log");
    }
  };

  return (
    <MainContainer>
      <Link href={`/dashboard/tank/${tankId}`}>
        <button className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          ← Back to Tank
        </button>
      </Link>

      <h1 className="text-2xl font-bold mb-2">
        Water Logs for {tank?.name ? `Tank "${tank.name}"` : `Tank #${tankId}`}
      </h1>
      {tank && (
        <p className="text-gray-600 mb-4">
          {tank.gallons} gallons – {tank.water_type} water
        </p>
      )}

      {/* 🧪 Add Log Form */}
      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {["ph", "hardness", "ammonia", "nitrite", "nitrate", "salinity"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(form as any)[field]}
                onChange={handleChange}
                className="border p-2"
              />
            )
          )}
        </div>

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 mb-4 w-full max-w-xl"
          rows={3}
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Submit Log
        </button>
      </form>

      {/* 📋 Existing Logs Table */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Previous Logs</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-2 py-1">Date</th>
              <th className="px-2 py-1">pH</th>
              <th className="px-2 py-1">Hardness</th>
              <th className="px-2 py-1">Ammonia</th>
              <th className="px-2 py-1">Nitrite</th>
              <th className="px-2 py-1">Nitrate</th>
              <th className="px-2 py-1">Salinity</th>
              <th className="px-2 py-1">Notes</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-2 py-1">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                {editingLog === log.id ? (
                  <>
                    {[
                      "ph",
                      "hardness",
                      "ammonia",
                      "nitrite",
                      "nitrate",
                      "salinity",
                    ].map((field) => (
                      <td key={field}>
                        <input
                          name={field}
                          value={(editForm as any)[field] ?? ""}
                          onChange={handleEditChange}
                          className="border p-1 w-full"
                        />
                      </td>
                    ))}
                    <td>
                      <textarea
                        name="notes"
                        value={editForm.notes ?? ""}
                        onChange={handleEditChange}
                        className="border p-1 w-full"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleSaveEdit(log.id)}
                        className="text-green-600"
                      >
                        Save
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-2 py-1">{log.ph}</td>
                    <td className="px-2 py-1">{log.hardness}</td>
                    <td className="px-2 py-1">{log.ammonia}</td>
                    <td className="px-2 py-1">{log.nitrite}</td>
                    <td className="px-2 py-1">{log.nitrate}</td>
                    <td className="px-2 py-1">{log.salinity ?? "N/A"}</td>
                    <td className="px-2 py-1">{log.notes ?? "None"}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingLog(log.id);
                          setEditForm(log);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainContainer>
  );
}
