// 📄 File: src/app/tank/[id]/page.tsx

export default async function TankDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Awaitable params
}) {
  const { id } = await params; // ✅ Await required by Next.js App Router

  return <div>Tank Detail for ID: {id}</div>;
}
