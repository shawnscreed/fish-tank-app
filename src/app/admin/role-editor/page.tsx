"use client";

import { useEffect, useState } from "react";

export default function AdminRoleEditorPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/role-editor")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin – RoleEditor</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
