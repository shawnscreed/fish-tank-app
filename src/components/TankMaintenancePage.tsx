// components/TankMaintenancePage.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MaintenanceLogClient() {
  const { id } = useParams();
  const [waterChanges, setWaterChanges] = useState<any[]>([]);
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [allChemicals, setAllChemicals] = useState<any[]>([]);
  const [changePercent, setChangePercent] = useState(0);
  const [changeNotes, setChangeNotes] = useState("");

  useEffect(() => {
    fetch(`/api/work/${id}/waterchange`).then(res => res.json()).then(setWaterChanges);
    fetch(`/api/work/${id}/chemical`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setChemicals(data);
      else setChemicals([]);
    });
    fetch("/api/chemicals").then(res => res.json()).then(setAllChemicals);
  }, [id]);

  const addWaterChange = async () => {
    const res = await fetch(`/api/work/${id}/waterchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent_changed: changePercent, notes: changeNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWaterChanges([updated, ...waterChanges]);
      setChangePercent(0);
      setChangeNotes("");
    }
  };

  const updateChemicalField = async (chemicalId: number, field: string, value: string) => {
    const target = chemicals.find(c => c.id === chemicalId);
    if (!target) return;
    const updated = { ...target, [field]: value };

    const res = await fetch(`/api/work/${id}/chemical/${chemicalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chemical_id: updated.chemical_id,
        amount: updated.amount,
        notes: updated.notes,
      }),
    });

    if (res.ok) {
      const saved = await res.json();
      setChemicals(chemicals.map(c => c.id === saved.id ? saved : c));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tank #{id} Maintenance Log</h1>

      {/* Water Changes */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Water Changes</h2>
        <div className="bg-gray-100 p-4 rounded shadow mb-4">
          <input type="number" value={changePercent} onChange={(e) => setChangePercent(Number(e.target.value))} placeholder="% changed" className="border p-1 mr-2 w-28" />
          <input type="text" value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} placeholder="Notes" className="border p-1 mr-2 w-64" />
          <button onClick={addWaterChange} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
        </div>
        <ul className="text-sm text-gray-800">
          {waterChanges.map((wc, index) => (
            <li key={index} className="mb-1">
             {Number(wc.percent_changed).toFixed(2)}% on {new Date(wc.change_date).toLocaleDateString()} — {wc.notes || "No notes"}

            </li>
          ))}
        </ul>
      </div>

      {/* Chemical Additions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Chemical Additions</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="border px-3 py-2">Chemical</th>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {chemicals.map((chem) => (
                <tr key={chem.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{chem.chemical_name}</td>
                  <td className="border px-3 py-2">{new Date(chem.added_at).toLocaleDateString()}</td>
                  <td className="border px-3 py-2">
                    <input className="w-full border rounded px-2 py-1" value={chem.amount} onChange={(e) => updateChemicalField(chem.id, "amount", e.target.value)} />
                  </td>
                  <td className="border px-3 py-2">
                    <input className="w-full border rounded px-2 py-1" value={chem.notes || ""} onChange={(e) => updateChemicalField(chem.id, "notes", e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <Link href={`/work/${id}`} className="text-blue-600 underline hover:text-blue-800">
          ← Back to Tank Details
        </Link>
      </div>
    </div>
  );
}
