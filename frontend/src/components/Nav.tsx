import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Nav() {
  const { logout } = useAuth();
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm rounded-md ${
      isActive
        ? "bg-gray-200 dark:bg-gray-800 font-semibold"
        : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center gap-2 px-3 py-2">
        <NavLink to="/" end className={link}>
          部品一覧
        </NavLink>
        <NavLink to="/history" className={link}>
          履歴
        </NavLink>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="text-xs px-2 py-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ログアウト
        </button>
      </div>
    </nav>
  );
}
