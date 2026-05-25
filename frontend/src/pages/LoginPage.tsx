import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<{ password: string }>("/public-password")
      .then((r) => setHint(r.password))
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4"
      >
        <h1 className="text-xl font-bold">ログイン</h1>
        {hint && (
          <p className="text-xs text-gray-500">
            デモ用パスワード: <code className="font-mono">{hint}</code>
          </p>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-md font-semibold"
        >
          {submitting ? "送信中…" : "ログイン"}
        </button>
      </form>
    </div>
  );
}
