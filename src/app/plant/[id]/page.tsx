// 📄 File: src/app/plant/[id]/page.tsx

export default async function PlantsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Must be a Promise
}) {
  const { id } = await params; // ✅ Await it

  return <div>Plants Detail for ID: {id}</div>;
}
