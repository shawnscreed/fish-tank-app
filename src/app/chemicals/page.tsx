// File: app/chemicals/page.tsx - Manage the chemical inventory

"use client";

import { useEffect, useState } from "react";
import ClientLayout from "@/app/ClientLayout";

interface Chemical {
  id: number;
  name: string;
  purpose: string;
  purchase_link?: string;
  notes?: string;
  in_use: boolean;
}

export default function ChemicalsPage() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [form, setForm] = useState({
    name: "",
    purpose: "",
    purchase_link: "",
    notes: "",
    in_use: true,
  });

  useEffect(() => {
    fetch("/api/chemicals")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setChemicals(data.filter((c) => c.in_use)) : setChemicals([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/chemicals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newChem = await res.json();
      setChemicals((prev) => [newChem, ...prev]);
      setForm({ name: "", purpose: "", purchase_link: "", notes: "", in_use: true });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/chemicals/${id}`, { method: "DELETE" });
    if (res.ok) {
      setChemicals((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Chemical Inventory</h1>

        <div className="bg-gray-100 p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Add New Chemical</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-1 w-full"
            />
            <input
              type="text"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Purpose"
              className="border p-1 w-full"
            />
            <input
              type="text"
              name="purchase_link"
              value={form.purchase_link}
              onChange={handleChange}
              placeholder="Purchase Link"
              className="border p-1 w-full"
            />
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="border p-1 w-full"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add Chemical
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2">Chemical List</h2>
        <ul className="text-sm text-gray-800 space-y-1">
          {chemicals.map((chem) => (
            <li key={chem.id} className="border p-2 rounded bg-white shadow">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{chem.name}</strong> — {chem.purpose}<br />
                  {chem.notes && <p className="text-xs italic">{chem.notes}</p>}
                  {chem.purchase_link && (
                    <a
                      href={chem.purchase_link}
                      className="text-blue-600 underline text-xs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy Link
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(chem.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ClientLayout>
  );
}
