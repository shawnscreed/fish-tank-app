// 📄 File: src/components/TankReminderAlert.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TankReminderAlert({ tankId }: { tankId: number }) {
  const [hasDueReminders, setHasDueReminders] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      const res = await fetch("/api/tank-reminder");
      const data = await res.json();
      const tankReminders = data.filter((r: any) => r.tank_id === tankId);
      const due = tankReminders.some((r: any) => new Date(r.next_due) <= new Date());
      setHasDueReminders(due);
    };

    fetchReminders();
  }, [tankId]);

  if (!hasDueReminders) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
      ⚠️ Some maintenance reminders are due for this tank.{" "}
      <Link
        href={`/dashboard/tank/${tankId}/reminders`}
        className="underline font-semibold text-yellow-900"
      >
        View Reminders →
      </Link>
    </div>
  );
}
