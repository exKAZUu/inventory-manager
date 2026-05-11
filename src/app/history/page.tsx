import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    type?: string;
    partId?: string;
  }>;
}) {
  const sp = await searchParams;
  const where: {
    occurredAt?: { gte?: Date; lte?: Date };
    type?: string;
    partId?: string;
  } = {};

  if (sp.from) where.occurredAt = { ...where.occurredAt, gte: new Date(sp.from) };
  if (sp.to) {
    const to = new Date(sp.to);
    to.setHours(23, 59, 59, 999);
    where.occurredAt = { ...where.occurredAt, lte: to };
  }
  if (sp.type === "IN" || sp.type === "OUT") where.type = sp.type;
  if (sp.partId) where.partId = sp.partId;

  const [movements, parts] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: { part: true },
      orderBy: { occurredAt: "desc" },
      take: 500,
    }),
    prisma.part.findMany({ orderBy: { partNumber: "asc" } }),
  ]);

  const inputCls =
    "px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950";

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">入出庫履歴</h1>

      <form
        action="/history"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4"
      >
        <input
          type="date"
          name="from"
          defaultValue={sp.from ?? ""}
          className={inputCls}
        />
        <input
          type="date"
          name="to"
          defaultValue={sp.to ?? ""}
          className={inputCls}
        />
        <select name="type" defaultValue={sp.type ?? ""} className={inputCls}>
          <option value="">種別: 全て</option>
          <option value="IN">入庫</option>
          <option value="OUT">出庫</option>
        </select>
        <select name="partId" defaultValue={sp.partId ?? ""} className={inputCls}>
          <option value="">部品: 全て</option>
          {parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（{p.partNumber}）
            </option>
          ))}
        </select>
        <div className="col-span-2 sm:col-span-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            絞り込む
          </button>
          <Link
            href="/history"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
          >
            クリア
          </Link>
        </div>
      </form>

      {movements.length === 0 ? (
        <p className="text-sm text-gray-500 mt-8 text-center">
          該当する履歴はありません。
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
          {movements.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
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
                  <Link
                    href={`/parts/${m.partId}`}
                    className="truncate text-blue-600 hover:underline"
                  >
                    {m.part.name}（{m.part.partNumber}）
                  </Link>
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
    </div>
  );
}
