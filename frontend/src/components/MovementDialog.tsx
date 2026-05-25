import { useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";

type Props = {
  partId: number;
  type: "IN" | "OUT";
  currentStock: number;
  onSaved: () => void;
};

export default function MovementDialog({
  partId,
  type,
  currentStock,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isIn = type === "IN";
  const label = isIn ? "入庫" : "出庫";
  const color = isIn
    ? "bg-green-600 hover:bg-green-700"
    : "bg-orange-600 hover:bg-orange-700";

  function reset() {
    setQuantity("1");
    setReason("");
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      setError("1以上の数量を入力してください");
      return;
    }
    if (!isIn && q > currentStock) {
      const ok = confirm(
        `現在在庫(${currentStock})を超える出庫です。在庫マイナスになりますが続けますか？`
      );
      if (!ok) return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/movements", {
        part: partId,
        type,
        quantity: q,
        reason: reason.trim(),
      });
      setOpen(false);
      reset();
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${color} text-white px-4 py-3 rounded-md font-semibold`}
      >
        {label}を記録
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
            className="w-full max-w-sm bg-white dark:bg-gray-950 rounded-lg p-5 space-y-3"
          >
            <h2 className="font-bold text-lg">{label}を記録</h2>
            <label className="block">
              <div className="text-xs text-gray-500 mb-1">数量</div>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950"
              />
            </label>
            <label className="block">
              <div className="text-xs text-gray-500 mb-1">理由・メモ</div>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className={`${color} disabled:opacity-50 text-white px-4 py-2 rounded-md font-semibold`}
              >
                {submitting ? "保存中…" : "保存"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
