// file: src/components/StockList.tsx

import React from "react";

interface StockItem {
  id: number;
  name: string;
  type: string;
}

export default function StockList({ stock }: { stock: StockItem[] }) {
  const grouped = stock.reduce<Record<string, StockItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h2 className="text-lg font-semibold capitalize">{type}</h2>
          <ul className="list-disc ml-6">
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
