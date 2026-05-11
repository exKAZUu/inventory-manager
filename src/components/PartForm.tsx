"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PartFormValues = {
  id?: string;
  name: string;
  partNumber: string;
  unitPrice: number;
  manufacturer: string;
  location: string;
  minStock: number;
  note: string;
};

type FormState = Omit<PartFormValues, "unitPrice" | "minStock"> & {
  unitPrice: number | "";
  minStock: number | "";
};

export function PartForm({ initial }: { initial?: PartFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(
    initial ?? {
      name: "",
      partNumber: "",
      unitPrice: 0,
      manufacturer: "",
      location: "",
      minStock: 0,
      note: "",
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (values.unitPrice === "") {
      setError("単価を入力してください");
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      ...values,
      unitPrice: values.unitPrice,
      minStock: values.minStock === "" ? 0 : values.minStock,
    };
    const url = isEdit ? `/api/parts/${initial?.id}` : "/api/parts";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "保存に失敗しました");
      return;
    }
    const data = await res.json();
    router.push(`/parts/${data.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!initial?.id) return;
    if (!confirm("この部品と関連する入出庫履歴をすべて削除します。よろしいですか？")) return;
    setBusy(true);
    const res = await fetch(`/api/parts/${initial.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      setError("削除に失敗しました");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950";

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <Field label="部品名 *">
        <input
          required
          className={inputCls}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>
      <Field label="型番 * (重複不可)">
        <input
          required
          className={inputCls}
          value={values.partNumber}
          onChange={(e) => set("partNumber", e.target.value)}
        />
      </Field>
      <Field label="単価（円） *">
        <input
          required
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          className={inputCls}
          value={values.unitPrice}
          onChange={(e) => {
            const v = e.target.value;
            set("unitPrice", v === "" ? "" : Number(v));
          }}
        />
      </Field>
      <Field label="メーカー名">
        <input
          className={inputCls}
          value={values.manufacturer}
          onChange={(e) => set("manufacturer", e.target.value)}
        />
      </Field>
      <Field label="保管場所">
        <input
          className={inputCls}
          value={values.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </Field>
      <Field label="最低在庫数（下回るとアラート）">
        <input
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          className={inputCls}
          value={values.minStock}
          onChange={(e) => {
            const v = e.target.value;
            set("minStock", v === "" ? "" : Number(v));
          }}
        />
      </Field>
      <Field label="メモ・備考">
        <textarea
          rows={3}
          className={inputCls}
          value={values.note}
          onChange={(e) => set("note", e.target.value)}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-semibold"
        >
          {busy ? "保存中..." : isEdit ? "更新する" : "登録する"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="ml-auto text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-4 py-2 rounded-md"
          >
            削除
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1">{label}</span>
      {children}
    </label>
  );
}
