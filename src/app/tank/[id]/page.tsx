export default function TankDetailPage({ params }: { params: { id: string } }) {
  return <div>Tank Detail for ID: {params.id}</div>;
}