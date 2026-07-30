import { PetDetail } from "@/components/PetDetail";

export default async function PetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PetDetail petId={id} />;
}
