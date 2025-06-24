// 📄 Page: /admin/user-account-manager

'use client';

import { useEffect, useState } from 'react';
import { getUserFromClientCookies, JWTUser } from '@/lib/auth';
import ClientLayout from '@/app/ClientLayout';

type Role = 'user' | 'admin' | 'super_admin' | 'beta_tester';

type User = JWTUser & {
  created_at?: string;
};

export default function UserAccountManagerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<JWTUser | null>(null);

  // Add User form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as Role,
  });
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    getUserFromClientCookies().then(setCurrentUser);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/user-account-manager');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setAddError('All fields are required');
      return;
    }

    const res = await fetch('/api/admin/user-account-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    if (res.ok) {
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      setAddError(null);
      fetchUsers();
    } else {
      const data = await res.json();
      setAddError(data.error || 'Failed to create user');
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">User Account Manager</h1>

        {currentUser && (
          <p className="text-gray-500 mb-4">
            Logged in as <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.role})
          </p>
        )}

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add User'}
        </button>

        {showAddForm && (
          <div className="mb-6 border p-4 rounded bg-gray-50">
            <h2 className="font-semibold mb-2">Create New User</h2>
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
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="beta_tester">Beta Tester</option>
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
              <thead className="bg-gray-100 border-b text-left">
                <tr>
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Role</th>
                  <th className="py-2 px-4">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{user.id}</td>
                    <td className="py-2 px-4">{user.name || 'Unnamed'}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.role}</td>
                    <td className="py-2 px-4">
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
    </ClientLayout>
  );
}
