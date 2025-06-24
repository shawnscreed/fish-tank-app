export default async function InvertsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Inverts Detail for ID: {id}</div>;
}
