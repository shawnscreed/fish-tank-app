// 📄 File: src/app/fish/[id]/page.tsx

export default async function FishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ This must be a Promise
}) {
  const { id } = await params; // ✅ Await the params

  return <div>Fish Detail for ID: {id}</div>;
}
