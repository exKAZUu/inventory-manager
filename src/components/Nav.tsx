"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "部品", icon: "📦" },
  { href: "/history", label: "履歴", icon: "🕒" },
  { href: "/parts/new", label: "追加", icon: "＋" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Sidebar (desktop) */}
      <aside className="hidden sm:flex fixed top-0 left-0 h-screen w-56 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 gap-1">
        <div className="text-lg font-bold mb-4">在庫管理</div>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-2 rounded-md text-sm ${
                active
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
            >
              <span className="mr-2">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
        <div className="mt-auto">
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* Bottom tabs (mobile) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex-1 py-3 text-center text-xs ${
                active ? "text-blue-600 font-semibold" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <div className="text-lg leading-none">{it.icon}</div>
              <div>{it.label}</div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
