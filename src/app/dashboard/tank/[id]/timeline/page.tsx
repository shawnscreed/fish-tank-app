"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type TimelineEvent = {
  id: number;
  type: "water_test" | "fish_added" | "water_change" | "maintenance";
  date: string;
  summary: string;
};

const eventIcons: Record<TimelineEvent["type"], string> = {
  water_test: "💧",
  fish_added: "🐟",
  water_change: "🔁",
  maintenance: "🛠️",
};

export default function TankTimelinePage() {
  const { id } = useParams();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filters, setFilters] = useState<Record<TimelineEvent["type"], boolean>>({
    water_test: true,
    fish_added: true,
    water_change: true,
    maintenance: true,
  });

  useEffect(() => {
    fetch(`/api/tank/${id}/timeline`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Error loading timeline:", data.error);
          return;
        }
        setEvents(data);
      });
  }, [id]);

  const toggleFilter = (type: TimelineEvent["type"]) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredEvents = events.filter((event) => filters[event.type]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Tank Timeline</h1>
      <p className="text-gray-600 mb-4">A chronological history of this tank’s activity.</p>

      {/* Filter Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.keys(filters).map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters[type as TimelineEvent["type"]]}
              onChange={() => toggleFilter(type as TimelineEvent["type"])}
            />
            <span>
              {eventIcons[type as TimelineEvent["type"]]}{" "}
              {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </label>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-gray-500">No events found for this tank yet.</p>
      ) : (
        <div className="border-l-2 border-blue-500 pl-4 space-y-6">
          {filteredEvents.map((event) => (
            <div key={`${event.type}-${event.id}`} className="relative">
              <div className="absolute -left-[1.05rem] top-1 w-4 h-4 bg-blue-500 rounded-full" />
              <div className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</div>
              <div className="font-semibold">
                {eventIcons[event.type]} {event.summary}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href={`/dashboard/tank/${id}`} className="mt-8 inline-block text-blue-600 hover:underline">
        ← Back to Tank
      </Link>
    </div>
  );
}
