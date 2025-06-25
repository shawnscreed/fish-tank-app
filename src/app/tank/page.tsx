// 📄 File: src/app/tank/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import TankTableClient from '@/components/TankTableClient';
import { useEffect, useState } from 'react';
import { JWTUser } from '@/lib/auth';

export default function TankPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<JWTUser | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      const { id, name, email, role } = session.user as any;
      setCurrentUser({ id: Number(id), name, email, role });
    }
  }, [status, session, router]);

  if (status === 'loading' || !currentUser) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <ClientLayoutWrapper user={currentUser}>
      <TankTableClient />
    </ClientLayoutWrapper>
  );
}
