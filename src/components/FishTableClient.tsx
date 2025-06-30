// 📄 Page: /components/FishTableClient.tsx

"use client";

import MainContainer from "@/components/MainContainer";
import { useEffect, useState, useRef } from "react";

type Fish = {
  id?: number;
  name?: string;
  water_type?: string;
  ph_low?: number;
  ph_high?: number;
  hardness_low?: number;
  hardness_high?: number;
  temp_low?: number;
  temp_high?: number;
  in_use?: boolean;
  aggressiveness?: string;
};

export default function FishTableClient() {
  const [fishList, setFishList] = useState<Fish[]>([]);
  type EditMap = { [key: number]: Fish } & { new?: Fish };
  const [editing, setEditing] = useState<EditMap>({});

  // simple debounce map so we don't spam the API on fast typing
  const timers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  /* --------------------------- fetch helpers --------------------------- */
  const fetchFish = async () => {
    const res = await fetch("/api/fish");
    const data = await res.json();
    if (Array.isArray(data)) setFishList(data);
  };

  useEffect(() => {
    fetchFish();
  }, []);

  /* ----------------------------- auto-save ----------------------------- */
  const scheduleSave = (id: number | "new") => {
    // clear existing debounce timer
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => handleSave(id), 600); // 600ms debounce
  };

  const handleChange = (id: number | "new", field: keyof Fish, value: any) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    if (id !== "new") scheduleSave(id); // auto-save only existing rows
  };

  const handleSave = async (id: number | "new") => {
    const fish = editing[id];
    if (!fish) return;

    const method = id === "new" ? "POST" : "PUT";
    const url = id === "new" ? "/api/fish" : `/api/fish/${id}`;
    const body = id === "new" ? { ...fish, in_use: true } : fish;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchFish();
      setEditing((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/fish/${id}`, { method: "DELETE" });
    if (res.ok) fetchFish();
  };

  /* ----------------------------- columns ------------------------------ */
  const fields: (keyof Fish)[] = [
    "name",
    "water_type",
    "ph_low",
    "ph_high",
    "hardness_low",
    "hardness_high",
    "temp_low",
    "temp_high",
    "aggressiveness",
  ];

  /* ----------------------------- render ------------------------------- */
  return (
    <MainContainer>
      <h1 className="text-xl font-bold mb-4">Fish Table</h1>

      <table className="w-full table-auto border-collapse border border-gray-300 rounded shadow-sm text-sm">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field} className="border px-2 py-1 text-left">
                {field}
              </th>
            ))}
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fishList.map((fish) => {
            const rowBg =
              fish.water_type === "fresh"
                ? "bg-blue-50"
                : fish.water_type === "salt"
                ? "bg-blue-100"
                : "";
            return (
              <tr key={fish.id} className={rowBg}>
                {fields.map((field) => (
                  <td key={field} className="border px-2 py-1">
                    {field === "water_type" || field === "aggressiveness" ? (
                      <select
                        className="w-full border px-1 py-1"
                        value={editing[fish.id!]?.[field] ?? fish[field] ?? ""}
                        onChange={(e) => handleChange(fish.id!, field, e.target.value)}
                        onBlur={() => handleSave(fish.id!)}
                      >
                        <option value="">Select</option>
                        {field === "water_type" ? (
                          <>
                            <option value="fresh">Fresh</option>
                            <option value="salt">Salt</option>
                            <option value="brackish">Brackish</option>
                          </>
                        ) : (
                          <>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        className="w-full border px-1 py-1"
                        value={
                          String(editing[fish.id!]?.[field] ?? fish[field] ?? "")
                        }
                        onChange={(e) => handleChange(fish.id!, field, e.target.value)}
                        onBlur={() => handleSave(fish.id!)}
                      />
                    )}
                  </td>
                ))}
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => handleDelete(fish.id!)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}

          {/* ---------- new row ---------- */}
          <tr className="bg-green-50">
            {fields.map((field) => (
              <td key={field} className="border px-2 py-1">
                {field === "water_type" || field === "aggressiveness" ? (
                  <select
                    className="w-full border px-1 py-1"
                    value={editing["new"]?.[field] ?? ""}
                    onChange={(e) => handleChange("new", field, e.target.value)}
                  >
                    <option value="">Select</option>
                    {field === "water_type" ? (
                      <>
                        <option value="fresh">Fresh</option>
                        <option value="salt">Salt</option>
                        <option value="brackish">Brackish</option>
                      </>
                    ) : (
                      <>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </>
                    )}
                  </select>
                ) : (
                  <input
                    className="w-full border px-1 py-1"
                    value={String(editing["new"]?.[field] ?? "")}
                    onChange={(e) => handleChange("new", field, e.target.value)}
                  />
                )}
              </td>
            ))}
            <td className="border px-2 py-1 text-center">
              <button
                onClick={() => handleSave("new")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </MainContainer>
  );
}
