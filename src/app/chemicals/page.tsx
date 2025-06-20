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
  image_url?: string;
}

export default function ChemicalsPage() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [editing, setEditing] = useState<Record<number, Partial<Chemical> & { image?: File }>>({});

  useEffect(() => {
    fetch("/api/chemicals")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setChemicals(data) : []);
  }, []);

  const handleEditChange = (id: number, field: string, value: any) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleImageChange = (id: number, file: File | null) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], image: file || undefined }
    }));
  };

  const handleSave = async (id: number) => {
    const update = editing[id];
    if (!update) return;

    const chem = chemicals.find((c) => c.id === id);
    if (!chem) return;

    let image_url = chem.image_url ?? "";

    if (update.image) {
      const formData = new FormData();
      formData.append("file", update.image);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      image_url = data.url;
    }

    const res = await fetch("/api/chemicals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: update.name ?? chem.name,
        purpose: update.purpose ?? chem.purpose,
        purchase_link: update.purchase_link ?? chem.purchase_link,
        notes: update.notes ?? chem.notes,
        in_use: update.in_use ?? chem.in_use,
        image_url,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setChemicals((prev) => prev.map((c) => c.id === id ? updated : c));
      setEditing((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
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
      {/* Add New Chemical */}
      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Add New Chemical</h2>
        <form
          className="space-y-2"
         onSubmit={async (e) => {
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  let image_url = "";

  // ✅ Handle image upload
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const upload = new FormData();
    upload.append("file", imageFile);
    const res = await fetch("/api/uploads", {
      method: "POST",
      body: upload,
    });
    const data = await res.json();
    image_url = data.url;
  }

  // ✅ Now submit the chemical with image_url
  const res = await fetch("/api/chemicals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.get("name"),
      purpose: formData.get("purpose"),
      purchase_link: formData.get("purchase_link"),
      notes: formData.get("notes"),
      in_use: true,
      image_url,
    }),
  });

  if (res.ok) {
    const newChem = await res.json();
    setChemicals((prev) => [newChem, ...prev]);
    form.reset();
  }
}}

        >
          <input type="text" name="name" placeholder="Name" required className="border p-1 w-full" />
          <input type="text" name="purpose" placeholder="Purpose" className="border p-1 w-full" />
          <input type="text" name="purchase_link" placeholder="Purchase Link" className="border p-1 w-full" />
          <textarea name="notes" placeholder="Notes" className="border p-1 w-full" />
          <input type="file" name="image" accept="image/*" className="border p-1 w-full" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
            Add Chemical
          </button>
        </form>
      </div>

      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Chemical Inventory</h1>

        <ul className="space-y-4">
          {chemicals.map((chem) => {
            const edit = editing[chem.id] || {};
            return (
              <li key={chem.id} className="border p-4 rounded shadow-sm bg-white space-y-2">
                <div className="font-bold text-lg">
                  <input
                    type="text"
                    value={edit.name ?? chem.name}
                    onChange={(e) => handleEditChange(chem.id, "name", e.target.value)}
                    className="border p-1 w-full font-bold text-lg"
                    placeholder="Name"
                  />
                </div>

                <div className={`flex flex-col ${chem.image_url ? "md:flex-row" : ""} gap-4`}>

                  {/* Image on the LEFT */}
                  {chem.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={chem.image_url}
                        alt={chem.name}
                        className="w-48 h-auto object-contain border rounded"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={edit.purpose ?? chem.purpose}
                      onChange={(e) => handleEditChange(chem.id, "purpose", e.target.value)}
                      className="border p-1 w-full"
                      placeholder="Purpose"
                    />
                    <input
                      type="text"
                      value={edit.purchase_link ?? chem.purchase_link ?? ""}
                      onChange={(e) => handleEditChange(chem.id, "purchase_link", e.target.value)}
                      className="border p-1 w-full"
                      placeholder="Purchase Link"
                    />
                    <textarea
                      value={edit.notes ?? chem.notes ?? ""}
                      onChange={(e) => handleEditChange(chem.id, "notes", e.target.value)}
                      className="border p-1 w-full"
                      placeholder="Notes"
                    />
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={edit.in_use ?? chem.in_use}
                        onChange={(e) => handleEditChange(chem.id, "in_use", e.target.checked)}
                      />
                      In Use
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(chem.id, e.target.files?.[0] ?? null)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(chem.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDelete(chem.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </ClientLayout>
  );
}
