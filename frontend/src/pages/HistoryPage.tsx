import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type Movement, type Part } from "../lib/api";

export default function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const type = params.get("type") ?? "";
  const partId = params.get("part") ?? "";

  const [parts, setParts] = useState<Part[]>([]);
  const [movements, setMovements] = useState<Movement[] | null>(null);

  useEffect(() => {
    api.get<Part[]>("/parts").then(setParts);
  }, []);

  useEffect(() => {
    setMovements(null);
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (type) sp.set("type", type);
    if (partId) sp.set("part", partId);
    api.get<Movement[]>(`/movements?${sp}`).then(setMovements);
  }, [from, to, type, partId]);

  const inputCls =
    "px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950";

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">入出庫履歴</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <input
          type="date"
          value={from}
          onChange={(e) => updateParam("from", e.target.value)}
          className={inputCls}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => updateParam("to", e.target.value)}
          className={inputCls}
        />
        <select
          value={type}
          onChange={(e) => updateParam("type", e.target.value)}
          className={inputCls}
        >
          <option value="">種別: 全て</option>
          <option value="IN">入庫</option>
          <option value="OUT">出庫</option>
        </select>
        <select
          value={partId}
          onChange={(e) => updateParam("part", e.target.value)}
          className={inputCls}
        >
          <option value="">部品: 全て</option>
          {parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（{p.part_number}）
            </option>
          ))}
        </select>
        <div className="col-span-2 sm:col-span-4">
          <button
            type="button"
            onClick={() => setParams({})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
          >
            クリア
          </button>
        </div>
      </div>

      {movements === null ? (
        <p className="text-sm text-gray-500 mt-8 text-center">読み込み中…</p>
      ) : movements.length === 0 ? (
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
                    to={`/parts/${m.part}`}
                    className="truncate text-blue-600 hover:underline"
                  >
                    {m.part_name}（{m.part_number}）
                  </Link>
                </div>
                {m.reason && (
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {m.reason}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 shrink-0">
                {new Date(m.occurred_at).toLocaleString("ja-JP")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
