'use client';
import MainContainer from "@/components/MainContainer";
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
  const [passwords, setPasswords] = useState<{ [id: number]: string }>({});

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

  const handlePasswordChange = async (userId: number) => {
    const newPassword = passwords[userId];
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const res = await fetch('/api/admin/user-account-manager', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword }),
    });

    if (res.ok) {
      alert('Password updated');
      setPasswords({ ...passwords, [userId]: '' });
    } else {
      const err = await res.json();
      alert('Error: ' + err.error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const res = await fetch(`/api/admin/user-account-manager?userId=${userId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('User deleted');
      fetchUsers();
    } else {
      const err = await res.json();
      alert('Error: ' + err.error);
    }
  };

  if (status === 'loading' || !currentUser) {
    return <MainContainer>Checking session...</MainContainer>;
  }

  return (
    <ClientLayoutWrapper user={currentUser}>
      <MainContainer>
        <h1 className="text-2xl font-bold mb-4">👤 User Account Manager</h1>

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
                <option value="sub_admin">Sub Admin</option>
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
          <div className="overflow-x-auto space-y-6">
            {users.map((u) => (
              <div key={u.id} className="border p-4 rounded bg-white shadow">
                <p>
                  <strong>{u.name || 'Unnamed'}</strong> — {u.email} ({u.role})
                </p>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwords[u.id] || ''}
                    onChange={(e) =>
                      setPasswords({ ...passwords, [u.id]: e.target.value })
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => handlePasswordChange(u.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
     </MainContainer>
    </ClientLayoutWrapper>
  );
}
