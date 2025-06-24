export default async function TankDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Tank Detail for ID: {id}</div>;
}
