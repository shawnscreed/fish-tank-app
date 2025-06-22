// 📄 File: src/components/WaterLogPage.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

export default function WaterLogPage() {
  const params = useParams();
  const tankId = useMemo(() => parseInt(params?.id as string || "0", 10), [params]);

  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [form, setForm] = useState({
    ph: "",
    hardness: "",
    ammonia: "",
    nitrite: "",
    nitrate: "",
    salinity: "",
    notes: ""
  });

  const [editingLog, setEditingLog] = useState<null | number>(null);
  const [editForm, setEditForm] = useState<Partial<WaterLog>>({});

  useEffect(() => {
    if (!tankId) return;

    fetch(`/api/tanks/${tankId}/water`)
      .then(async (res) => {
        if (!res.ok) {
          console.error("Failed to fetch logs");
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error("Invalid logs response format", data);
          setLogs([]);
        }
      });
  }, [tankId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev: typeof form) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm((prev: Partial<WaterLog>) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/tanks/${tankId}/water`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ph: form.ph ? parseFloat(form.ph) : null,
        hardness: form.hardness ? parseFloat(form.hardness) : null,
        ammonia: form.ammonia ? parseFloat(form.ammonia) : null,
        nitrite: form.nitrite ? parseFloat(form.nitrite) : null,
        nitrate: form.nitrate ? parseFloat(form.nitrate) : null,
        salinity: form.salinity ? parseFloat(form.salinity) : undefined,
        notes: form.notes || undefined
      })
    });

    if (res.ok) {
      const newLog = await res.json();
      if (newLog && typeof newLog === "object") {
        setLogs(prev => [newLog, ...prev]);
      }
      setForm({
        ph: "",
        hardness: "",
        ammonia: "",
        nitrite: "",
        nitrate: "",
        salinity: "",
        notes: ""
      });
    } else {
      console.error("❌ Failed to submit log");
    }
  };

  const handleSaveEdit = async (logId: number) => {
    const res = await fetch(`/api/tanks/${tankId}/water/${logId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });

    if (res.ok) {
      const updated = await res.json();
      setLogs((prev: WaterLog[]) => prev.map(log => (log.id === logId ? updated : log)));
      setEditingLog(null);
      setEditForm({});
    } else {
      console.error("❌ Failed to update log");
    }
  };

  if (!tankId || isNaN(tankId)) return <p>Invalid tank ID</p>;

  return (
    <div className="p-6">
      <Link href={`/dashboard/tank/${tankId}`}>
        <button className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          ← Back to Tank
        </button>
      </Link>
      

      <h1 className="text-2xl font-bold mb-4">Water Logs for Tank #{tankId}</h1>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input name="ph" placeholder="pH" value={form.ph} onChange={handleChange} className="border p-2" />
          <input name="hardness" placeholder="Hardness" value={form.hardness} onChange={handleChange} className="border p-2" />
          <input name="ammonia" placeholder="Ammonia" value={form.ammonia} onChange={handleChange} className="border p-2" />
          <input name="nitrite" placeholder="Nitrite" value={form.nitrite} onChange={handleChange} className="border p-2" />
          <input name="nitrate" placeholder="Nitrate" value={form.nitrate} onChange={handleChange} className="border p-2" />
          <input name="salinity" placeholder="Salinity (optional)" value={form.salinity} onChange={handleChange} className="border p-2" />
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
            {logs.map(log => (
              <tr key={log.id} className="border-t">
                <td className="px-2 py-1">{new Date(log.created_at).toLocaleString()}</td>
                {editingLog === log.id ? (
                  <>
                    <td><input name="ph" value={editForm.ph ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td><input name="hardness" value={editForm.hardness ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td><input name="ammonia" value={editForm.ammonia ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td><input name="nitrite" value={editForm.nitrite ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td><input name="nitrate" value={editForm.nitrate ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td><input name="salinity" value={editForm.salinity ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td><textarea name="notes" value={editForm.notes ?? ""} onChange={handleEditChange} className="border p-1 w-full" /></td>
                    <td>
                      <button onClick={() => handleSaveEdit(log.id)} className="text-green-600">Save</button>
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
                      <button onClick={() => {
                        setEditingLog(log.id);
                        setEditForm(log);
                      }} className="text-blue-600">Edit</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
