export default async function FishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Fish Detail for ID: {id}</div>;
}
