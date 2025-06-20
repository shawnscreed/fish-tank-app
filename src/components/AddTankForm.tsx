"use client";
import { useState } from "react";

export default function AddTankForm({ userId }: { userId: number }) {
  const [name, setName] = useState("");
  const [gallons, setGallons] = useState("");
  const [waterType, setWaterType] = useState("fresh");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/tanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        gallons: Number(gallons),
        water_type: waterType,
        user_id: userId,
      }),
    });

    if (res.ok) {
      setStatus("Tank added!");
      setName("");
      setGallons("");
      setWaterType("fresh");

      // Wait then reload to show the new tank
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      const err = await res.json();
      setStatus(err.error || "Error adding tank");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <h3 className="text-lg font-semibold">Add a New Tank</h3>
      <input
        className="border rounded px-2 py-1 w-full"
        type="text"
        placeholder="Tank name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="border rounded px-2 py-1 w-full"
        type="number"
        placeholder="Gallons"
        value={gallons}
        onChange={(e) => setGallons(e.target.value)}
        required
      />
      <select
        className="border rounded px-2 py-1 w-full"
        value={waterType}
        onChange={(e) => setWaterType(e.target.value)}
      >
        <option value="fresh">Fresh</option>
        <option value="salt">Salt</option>
        <option value="brackish">Brackish</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Tank
      </button>
      {status && <p className="text-sm text-green-600">{status}</p>}
    </form>
  );
}
