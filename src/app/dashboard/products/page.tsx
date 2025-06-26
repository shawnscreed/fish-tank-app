// 📄 File: src/app/dashboard/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Chemical {
  id: number;
  name: string;
  buy_url?: string;
  description?: string;
  image_url?: string;
  in_use?: boolean; 
}

export default function ProductsPage() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);

  useEffect(() => {
    const fetchChemicals = async () => {
      const res = await fetch("/api/chemicals");
      const data = await res.json();
      const visible = data.filter((chem: Chemical) => chem.in_use === true);
      setChemicals(visible);
    };

    fetchChemicals();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Recommended Products</h1>
      <p className="mb-6 text-gray-600">
        Here's a list of chemicals and treatments we use and recommend for your aquarium.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chemicals.map((chem) => (
          <div
            key={chem.id}
            className="border rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition"
          >
            {chem.image_url && (
              <img
                src={chem.image_url}
                alt={chem.name}
                className="w-full h-48 object-contain mb-4"
              />
            )}
            <h2 className="text-xl font-semibold">{chem.name}</h2>
            {chem.description && <p className="text-sm text-gray-600 mb-3">{chem.description}</p>}
            {chem.buy_url && (
              <a
                href={chem.buy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Buy Now →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/dashboard" className="text-blue-600 underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
