export default function FishDetailPage({ params }: { params: { id: string } }) {
  return <div>Fish Detail for ID: {params.id}</div>;
}