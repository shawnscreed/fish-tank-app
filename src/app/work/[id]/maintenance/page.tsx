"use client";

import { useParams } from "next/navigation";
import ClientLayout from "@/app/ClientLayout";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MaintenanceLogPage() {
  const { id } = useParams();

  const [waterChanges, setWaterChanges] = useState<any[]>([]);
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [allChemicals, setAllChemicals] = useState<any[]>([]);

  const [changePercent, setChangePercent] = useState(0);
  const [changeNotes, setChangeNotes] = useState("");

  const [chemicalId, setChemicalId] = useState("");
  const [amount, setAmount] = useState("");
  const [chemNotes, setChemNotes] = useState("");

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

  const addChemical = async () => {
    const res = await fetch(`/api/work/${id}/chemical`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chemical_id: chemicalId, amount, notes: chemNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setChemicals([updated, ...chemicals]);
      setChemicalId("");
      setAmount("");
      setChemNotes("");
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Tank #{id} Maintenance Log</h1>

        {/* Water Change Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Water Changes</h2>
          <p className="text-sm text-gray-600 mb-2">Log partial/full water changes for this tank.</p>

          <div className="bg-gray-100 p-4 rounded shadow mb-4">
            <input type="number" value={changePercent} onChange={(e) => setChangePercent(Number(e.target.value))} placeholder="% changed" className="border p-1 mr-2 w-28" />
            <input type="text" value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} placeholder="Notes" className="border p-1 mr-2 w-64" />
            <button onClick={addWaterChange} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
          </div>

          <ul className="text-sm text-gray-800">
            {waterChanges.map((wc, index) => (
              <li key={index} className="mb-1">
                {wc.percent_changed}% on {new Date(wc.change_date).toLocaleDateString()} — {wc.notes || "No notes"}
              </li>
            ))}
          </ul>
        </div>

        {/* Chemical Addition Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Chemical Additions</h2>
          <p className="text-sm text-gray-600 mb-2">Track any dosing or chemical treatments.</p>

          <div className="bg-gray-100 p-4 rounded shadow mb-4">
            <select value={chemicalId} onChange={(e) => setChemicalId(e.target.value)} className="border p-1 mr-2 w-40">
              <option value="">Select chemical</option>
              {allChemicals.map((chem) => (
                <option key={chem.id} value={chem.id}>{chem.name}</option>
              ))}
            </select>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (e.g. 5ml)" className="border p-1 mr-2 w-32" />
            <input type="text" value={chemNotes} onChange={(e) => setChemNotes(e.target.value)} placeholder="Notes" className="border p-1 mr-2 w-64" />
            <button onClick={addChemical} className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
          </div>

          <ul className="text-sm text-gray-800 space-y-2">
            {chemicals.map((chem, index) => (
              <li key={index} className="flex items-start gap-4 bg-white p-3 rounded shadow-sm">
                {chem.image_url && (
                  <img
                    src={chem.image_url}
                    alt={chem.chemical_name}
                    className="w-12 h-12 object-contain border rounded"
                  />
                )}
                <div>
                  <div className="font-semibold">{chem.chemical_name}</div>
                  <div className="text-sm">{chem.amount} on {new Date(chem.added_at).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-600 italic">{chem.notes || "No notes"}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <Link href={`/work/${id}`} className="text-blue-600 underline hover:text-blue-800">
            ← Back to Tank Details
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}
