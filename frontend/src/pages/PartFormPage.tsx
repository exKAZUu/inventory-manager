import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError, type Part } from "../lib/api";

type Mode = "create" | "edit";

type Draft = {
  name: string;
  part_number: string;
  unit_price: string;
  manufacturer: string;
  location: string;
  min_stock: string;
  note: string;
};

const empty: Draft = {
  name: "",
  part_number: "",
  unit_price: "0",
  manufacturer: "",
  location: "",
  min_stock: "0",
  note: "",
};

export default function PartFormPage({ mode }: { mode: Mode }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [draft, setDraft] = useState<Draft>(empty);
  const [loaded, setLoaded] = useState(mode === "create");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    api.get<Part>(`/parts/${id}`).then((p) => {
      setDraft({
        name: p.name,
        part_number: p.part_number,
        unit_price: String(p.unit_price),
        manufacturer: p.manufacturer,
        location: p.location,
        min_stock: String(p.min_stock),
        note: p.note,
      });
      setLoaded(true);
    });
  }, [mode, id]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      name: draft.name.trim(),
      part_number: draft.part_number.trim(),
      unit_price: Number(draft.unit_price) || 0,
      manufacturer: draft.manufacturer.trim(),
      location: draft.location.trim(),
      min_stock: Number(draft.min_stock) || 0,
      note: draft.note,
    };
    try {
      if (mode === "create") {
        const created = await api.post<Part>("/parts", payload);
        nav(`/parts/${created.id}`, { replace: true });
      } else {
        await api.patch<Part>(`/parts/${id}`, payload);
        nav(`/parts/${id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("この部品と入出庫履歴を削除します。よろしいですか？")) return;
    await api.delete<void>(`/parts/${id}`);
    nav("/", { replace: true });
  }

  if (!loaded) {
    return <div className="p-8 text-center text-sm text-gray-500">読み込み中…</div>;
  }

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950";

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "create" ? "部品を追加" : "部品を編集"}
      </h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="部品名" required>
          <input
            required
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="型番" required>
          <input
            required
            value={draft.part_number}
            onChange={(e) => set("part_number", e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="単価 (円)">
            <input
              type="number"
              min={0}
              value={draft.unit_price}
              onChange={(e) => set("unit_price", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="最低在庫">
            <input
              type="number"
              min={0}
              value={draft.min_stock}
              onChange={(e) => set("min_stock", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="メーカー">
          <input
            value={draft.manufacturer}
            onChange={(e) => set("manufacturer", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="保管場所">
          <input
            value={draft.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="メモ">
          <textarea
            value={draft.note}
            onChange={(e) => set("note", e.target.value)}
            rows={3}
            className={inputCls}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-semibold"
          >
            {submitting ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          >
            キャンセル
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </div>
      {children}
    </label>
  );
}
