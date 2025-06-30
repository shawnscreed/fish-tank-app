"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import Link from "next/link";

type TankCardProps = {
  tank: {
    id: number;
    name: string;
    gallons: number;
    water_type: string;
    public_id: string;
  };
};

export default function TankCardClient({ tank }: TankCardProps) {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const publicUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://fishkeeperapp.com"
  }/t/${tank.public_id}`;

  const downloadQR = async () => {
    if (!qrRef.current) return;
    const png = await toPng(qrRef.current);
    const link = document.createElement("a");
    link.download = `${tank.name || "tank"}-qr.png`;
    link.href = png;
    link.click();
  };

  return (
    <li className="rounded-xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      {/* ── Top section ── */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">
          {tank.name || "Unnamed Tank"}
        </h3>
        <p className="text-sm text-gray-500">
          {tank.gallons} gal • {tank.water_type}
        </p>

        {/* QR toggle button */}
        <button
          onClick={() => setShowQR((v) => !v)}
          className="mt-2 bg-gray-700 text-white text-xs px-3 py-1 rounded"
        >
          {showQR ? "Hide QR" : "Show QR"}
        </button>

        {/* QR label & download */}
        {showQR && (
          <div className="mt-3 flex flex-col items-center" ref={qrRef}>
            <QRCode value={publicUrl} size={120} />
            <button
              onClick={downloadQR}
              className="mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-700"
            >
              Download
            </button>
          </div>
        )}
      </div>

      {/* ── Quick links ── */}
      <nav className="grid grid-cols-2 border-t divide-x">
        <Link
          href={`/dashboard/tank/${tank.id}`}
          className="p-2 text-center text-sm hover:bg-gray-50"
        >
          Details
        </Link>
        <Link
          href={`/dashboard/tank/${tank.id}/timeline`}
          className="p-2 text-center text-sm hover:bg-gray-50"
        >
          Timeline
        </Link>
        <Link
          href={`/dashboard/tank/${tank.id}/maintenance`}
          className="p-2 text-center text-sm hover:bg-gray-50"
        >
          Maintenance
        </Link>
        <Link
          href={`/dashboard/tank/${tank.id}/water`}
          className="p-2 text-center text-sm hover:bg-gray-50"
        >
          Water Tests
        </Link>
      </nav>
    </li>
  );
}
