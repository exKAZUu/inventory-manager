import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PartForm } from "@/components/PartForm";

export const dynamic = "force-dynamic";

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) notFound();

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">部品を編集</h1>
      <PartForm
        initial={{
          id: part.id,
          name: part.name,
          partNumber: part.partNumber,
          unitPrice: part.unitPrice,
          manufacturer: part.manufacturer ?? "",
          location: part.location ?? "",
          minStock: part.minStock,
          note: part.note ?? "",
        }}
      />
    </div>
  );
}
