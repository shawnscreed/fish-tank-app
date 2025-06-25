// 📄 File: src/app/inverts/[id]/page.tsx

export default async function InvertsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Must be a Promise
}) {
  const { id } = await params; // ✅ Await it

  return <div>Inverts Detail for ID: {id}</div>;
}
