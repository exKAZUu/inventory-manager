import Link from "next/link";
import { listPartsWithStock } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function PartsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const parts = await listPartsWithStock(q?.trim() || undefined);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">部品一覧</h1>
        <Link
          href="/parts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-semibold"
        >
          ＋ 部品を追加
        </Link>
      </div>

      <form className="mb-4" action="/">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="部品名・型番で検索"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950"
        />
      </form>

      {parts.length === 0 ? (
        <p className="text-sm text-gray-500 mt-8 text-center">
          {q ? "該当する部品はありません" : "まだ部品が登録されていません。「＋ 部品を追加」から登録してください。"}
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950">
          {parts.map((p) => {
            const negative = p.stock < 0;
            const low = !negative && p.stock < p.minStock;
            return (
              <li key={p.id}>
                <Link
                  href={`/parts/${p.id}`}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {p.partNumber}
                      {p.manufacturer ? ` ・ ${p.manufacturer}` : ""}
                      {p.location ? ` ・ ${p.location}` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-lg font-bold ${
                        negative || low ? "text-red-600" : ""
                      }`}
                    >
                      {p.stock}
                      <span className="text-xs font-normal text-gray-500 ml-1">個</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ¥{p.unitPrice.toLocaleString("ja-JP")}
                    </div>
                    {negative ? (
                      <span className="inline-block mt-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">
                        在庫マイナス
                      </span>
                    ) : low ? (
                      <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-1.5 py-0.5 rounded">
                        最低在庫割れ
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
