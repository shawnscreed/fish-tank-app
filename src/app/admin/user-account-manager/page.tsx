"use client";

import { useEffect, useState } from "react";

export default function AdminUserAccountManagerPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/user-account-manager")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin – UserAccountManager</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
