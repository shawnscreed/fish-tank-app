export default async function PlantsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Plants Detail for ID: {id}</div>;
}
