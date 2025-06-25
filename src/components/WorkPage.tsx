"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type WorkEntry = {
  id: number;
  water_type: string;
  gallons: number;
  is_complete: boolean;
  created_at: string;
  tank_id?: number;
  tank_name?: string;
};

type Tank = {
  id: number;
  name: string;
};

type Fish = {
  id: number;
  name: string;
};

export default function WorkPage({ userId }: { userId: number }) {
  const [waterType, setWaterType] = useState("");
  const [gallons, setGallons] = useState("");
  const [tankId, setTankId] = useState("");
  const [fishId, setFishId] = useState("");
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [fishList, setFishList] = useState<Fish[]>([]);

  const fetchWorkEntries = async () => {
    const res = await fetch("/api/work");
    if (res.ok) {
      const data = await res.json();
      setWorkEntries(data);
    } else {
      console.error("Failed to fetch work entries");
    }
  };

  const fetchTanks = async () => {
    const res = await fetch("/api/tank");
    if (res.ok) {
      const data = await res.json();
      setTanks(data);
    }
  };

  const fetchFish = async () => {
    const res = await fetch("/api/fish");
    if (res.ok) {
      const data = await res.json();
      setFishList(data);
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        water_type: waterType,
        gallons,
        user_id: userId,
      }),
    });

    if (res.ok) {
      const newEntry = await res.json();
      setWorkEntries((prev) => [...prev, newEntry]);
      setWaterType("");
      setGallons("");
    } else {
      alert("Failed to save.");
    }
  };

  useEffect(() => {
    fetchWorkEntries();
    fetchTanks();
    fetchFish();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tank Setup</h1>

      <label className="block mb-2">
        Water Type:
        <select
          value={waterType}
          onChange={(e) => setWaterType(e.target.value)}
          className="border p-1 ml-2"
        >
          <option value="">Select</option>
          <option value="fresh">Fresh</option>
          <option value="salt">Salt</option>
          <option value="brackish">Brackish</option>
        </select>
      </label>

      <label className="block mb-4">
        Gallons:
        <input
          type="number"
          value={gallons}
          onChange={(e) => setGallons(e.target.value)}
          className="border ml-2 p-1"
        />
      </label>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <h2 className="text-lg font-semibold mt-8 mb-2">Previous Work Entries</h2>
      <ul className="list-disc pl-5">
        {workEntries.map((entry) => (
          <li key={entry.id} className="mb-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/work/${entry.id}`}
                className="text-blue-600 hover:underline"
              >
                <strong>Tank:</strong> {entry.tank_name || "Unnamed"} –{" "}
                <strong>Water Type:</strong> {entry.water_type},{" "}
                <strong>Gallons:</strong> {entry.gallons}
              </Link>

              <button
                onClick={async () => {
                  const res = await fetch(`/api/work/${entry.id}`, {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    setWorkEntries((prev) =>
                      prev.filter((e) => e.id !== entry.id)
                    );
                  } else {
                    alert("Failed to delete.");
                  }
                }}
                className="ml-4 bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
