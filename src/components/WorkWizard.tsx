"use client";

import { useEffect, useState } from "react";

export default function WorkWizard({
  userId,
  tankId,
}: {
  userId: number;
  tankId: number;
}) {
  const [workId, setWorkId] = useState<number | null>(null);
  const [step, setStep] = useState("start");

  useEffect(() => {
    // fetch existing work session or create one
    fetch("/api/work/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, tank_id: tankId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setWorkId(data.id);
        setStep(data.current_step || "add_fish");
      });
  }, [tankId]);

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="text-lg font-bold mb-2">Working on Tank #{tankId}</h3>
      <p className="mb-2">Current Step: {step}</p>

      {/* TODO: Show fish step, chem step, etc */}
      {/* This is where your logic from /work/page.tsx goes */}

      <button
        onClick={() => {
          // advance to next step or mark complete
        }}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Continue
      </button>
    </div>
  );
}
