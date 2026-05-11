import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPartStock } from "@/lib/stock";
import { MovementDialog } from "@/components/MovementDialog";

export const dynamic = "force-dynamic";

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) notFound();

  const [stock, movements] = await Promise.all([
    getPartStock(id),
    prisma.stockMovement.findMany({
      where: { partId: id },
      orderBy: { occurredAt: "desc" },
      take: 100,
    }),
  ]);

  const low = stock < part.minStock;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">{part.name}</h1>
          <p className="text-sm text-gray-500 truncate">型番: {part.partNumber}</p>
        </div>
        <Link
          href={`/parts/${part.id}/edit`}
          className="text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
        >
          編集
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="現在在庫" value={`${stock} 個`} highlight={low} />
        <Stat label="最低在庫" value={`${part.minStock} 個`} />
        <Stat label="単価" value={`¥${part.unitPrice.toLocaleString("ja-JP")}`} />
        <Stat
          label="在庫評価額"
          value={`¥${(stock * part.unitPrice).toLocaleString("ja-JP")}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <MovementDialog partId={part.id} type="IN" />
        <MovementDialog partId={part.id} type="OUT" />
      </div>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">部品情報</h2>
        <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <Row k="メーカー" v={part.manufacturer ?? "—"} />
          <Row k="保管場所" v={part.location ?? "—"} />
          <Row k="メモ" v={part.note ?? "—"} />
        </dl>
      </section>

      <section>
        <h2 className="font-semibold mb-2">入出庫履歴</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-gray-500">履歴はまだありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
            {movements.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${
                        m.type === "IN"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                      }`}
                    >
                      {m.type === "IN" ? "入庫" : "出庫"}
                    </span>
                    <span className="font-semibold">
                      {m.type === "IN" ? "+" : "−"}
                      {m.quantity}
                    </span>
                  </div>
                  {m.reason && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {m.reason}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 shrink-0">
                  {new Date(m.occurredAt).toLocaleString("ja-JP")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold ${highlight ? "text-red-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-gray-500">{k}</dt>
      <dd className="col-span-2 whitespace-pre-wrap break-words">{v}</dd>
    </>
  );
}
