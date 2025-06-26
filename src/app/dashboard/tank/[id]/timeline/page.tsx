"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { getUserFromClientCookies, JWTUser } from "@/lib/auth";
import Link from "next/link";

interface TankEvent {
  type: "fish_added" | "water_log" | "maintenance" | "reminder_done";
  date: string;
  summary: string;
  details?: string;
}

export default function TankTimelinePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [user, setUser] = useState<JWTUser | null>(null);
  const [events, setEvents] = useState<TankEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const u = await getUserFromClientCookies();
      setUser(u);

      const res = await fetch(`/api/tank-timeline?tank_id=${id}`);
      const data = await res.json();
      setEvents(data);
    };

    load();
  }, [id]);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <ClientLayoutWrapper user={user}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Tank Timeline</h1>
        <p className="text-gray-600 mb-6">A chronological history of this tank’s activity.</p>

        {events.length === 0 ? (
          <p className="text-gray-500">No events found for this tank yet.</p>
        ) : (
          <ol className="relative border-l border-blue-300 space-y-6 pl-4">
            {events.map((event, index) => (
              <li key={index} className="ml-4">
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 mt-1.5"></div>
                <time className="block mb-1 text-sm font-medium text-blue-800">
                  {new Date(event.date).toLocaleString()}
                </time>
                <h3 className="font-semibold">{event.summary}</h3>
                {event.details && (
                  <p className="text-sm text-gray-700">{event.details}</p>
                )}
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6">
          <Link
            href={`/dashboard/tank/${id}`}
            className="text-blue-600 underline"
          >
            ← Back to Tank
          </Link>
        </div>
      </div>
    </ClientLayoutWrapper>
  );
}
