"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MovementDialog({
  partId,
  type,
}: {
  partId: string;
  type: "IN" | "OUT";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = type === "IN" ? "入庫を記録" : "出庫を記録";
  const color =
    type === "IN"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-orange-600 hover:bg-orange-700";

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/parts/${partId}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, quantity, reason }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "登録に失敗しました");
      return;
    }
    setOpen(false);
    setQuantity(1);
    setReason("");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${color} text-white font-semibold py-4 rounded-lg text-base`}
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-lg w-full max-w-sm p-5 shadow-xl">
            <h2 className="text-lg font-bold mb-3">
              {type === "IN" ? "入庫" : "出庫"}を記録
            </h2>
            <label className="block text-sm mb-1">数量</label>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent mb-3"
              autoFocus
            />
            <label className="block text-sm mb-1">理由・メモ（任意）</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={busy || quantity < 1}
                className={`${color} flex-1 text-white py-2 rounded-md font-semibold disabled:opacity-50`}
              >
                {busy ? "保存中..." : "記録する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
