'use client';

import { useEffect, useState } from 'react';
import ClientLayout from '@/app/ClientLayout';

interface RoleAssignment {
  user_id: number;
  email: string;
  name?: string;
  role: string;
}

export default function RoleEditorPage() {
  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/admin/role-editor');
        if (!res.ok) throw new Error('Failed to load roles');
        const data = await res.json();
        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  const updateRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/role-editor/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      setRoles((prev) =>
        prev.map((r) =>
          r.user_id === userId ? { ...r, role: newRole } : r
        )
      );
    } catch (err) {
      alert('Failed to update role');
      console.error(err);
    }
  };

  
  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">👥 Role Editor</h1>

        {loading ? (
          <p>Loading roles...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Current Role</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.user_id}>
                  <td className="border p-2">{r.name || 'Unnamed'}</td>
                  <td className="border p-2">{r.email}</td>
                  <td className="border p-2">
                    <select
                      value={r.role}
                      onChange={(e) => updateRole(r.user_id, e.target.value)}
                      className="border px-2 py-1"
                    >
                      <option value="user">user</option>
                      <option value="beta_user">beta_user</option>
                      <option value="sub_admin">sub_admin</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClientLayout>
  );
}
