export default async function CoralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Coral Detail for ID: {id}</div>;
}
