import { PartForm } from "@/components/PartForm";

export default function NewPartPage() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">部品を追加</h1>
      <PartForm />
    </div>
  );
}
