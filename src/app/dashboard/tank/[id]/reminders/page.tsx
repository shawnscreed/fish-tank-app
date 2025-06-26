// 📄 File: src/app/dashboard/tank/[id]/reminders/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Reminder {
  id: number;
  tank_id: number;
  type: string;
  frequency_days: number;
  last_done: string;
  next_due: string;
  notes: string;
}

export default function TankRemindersPage() {
  const { id } = useParams();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState({
    type: "",
    frequency_days: "",
    notes: "",
  });

  const fetchReminders = async () => {
    const res = await fetch(`/api/tank-reminder`);
    const data = await res.json();
    setReminders(data.filter((r: Reminder) => r.tank_id === Number(id)));
  };

  const handleAdd = async () => {
    await fetch("/api/tank-reminder", {
      method: "POST",
      body: JSON.stringify({ ...newReminder, tank_id: Number(id) }),
    });
    setNewReminder({ type: "", frequency_days: "", notes: "" });
    fetchReminders();
  };

  const handleDone = async (rid: number) => {
    await fetch("/api/tank-reminder", {
      method: "PUT",
      body: JSON.stringify({ id: rid }),
    });
    fetchReminders();
  };

  const handleDelete = async (rid: number) => {
    await fetch("/api/tank-reminder", {
      method: "DELETE",
      body: JSON.stringify({ id: rid }),
    });
    fetchReminders();
  };

  useEffect(() => {
    fetchReminders();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tank Maintenance Reminders</h1>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Type (e.g., Water Change)"
          className="border p-2 w-full"
          value={newReminder.type}
          onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
        />
        <input
          type="number"
          placeholder="Frequency in Days"
          className="border p-2 w-full"
          value={newReminder.frequency_days}
          onChange={(e) => setNewReminder({ ...newReminder, frequency_days: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          className="border p-2 w-full"
          value={newReminder.notes}
          onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
          Add Reminder
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Type</th>
            <th>Next Due</th>
            <th>Frequency (days)</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.type}</td>
              <td>{r.next_due}</td>
              <td>{r.frequency_days}</td>
              <td>{r.notes}</td>
              <td className="space-x-2">
                <button onClick={() => handleDone(r.id)} className="text-green-600 underline">
                  Mark Done
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-red-600 underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <Link href={`/dashboard/tank/${id}`} className="text-blue-600 underline">
          ← Back to Tank
        </Link>
      </div>
    </div>
  );
}
