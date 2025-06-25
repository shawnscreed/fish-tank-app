// 📄 Page: /admin/user-account-manager/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import type { Role, JWTUser } from '@/lib/auth';

type User = {
  id: number;
  name?: string;
  email: string;
  role: Role;
  created_at?: string;
};

export default function UserAccountManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<JWTUser | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as Role,
  });
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setCurrentUser({
        id: Number((session.user as any).id),
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role,
      });
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/user-account-manager');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setAddError('All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/user-account-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      setAddError(null);
      fetchUsers();
    } catch (err: any) {
      setAddError(err.message || 'Unexpected error');
    }
  };

  if (status === 'loading' || !currentUser) {
    return (
      <div className="p-6 text-gray-500">Checking session...</div>
    );
  }

  return (
    <ClientLayoutWrapper user={currentUser}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">User Account Manager</h1>

        <p className="text-gray-600 mb-4">
          Logged in as <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.role})
        </p>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>

        {showAddForm && (
          <div className="mb-8 border p-4 rounded bg-gray-50">
            <h2 className="font-semibold mb-3">Create New User</h2>
            {addError && <p className="text-red-600 mb-2">{addError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border px-3 py-2 rounded"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                className="border px-3 py-2 rounded"
              >
                <option value="user">User</option>
                <option value="beta_user">Beta User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <button
                onClick={handleAddUser}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 col-span-full"
              >
                Save User
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Role</th>
                  <th className="p-3 border-b">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 border-t">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.name || 'Unnamed'}</td>
                    <td className="p-3 font-mono">{user.email}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3 text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ClientLayoutWrapper>
  );
}
