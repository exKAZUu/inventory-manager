import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Nav from "./components/Nav";
import LoginPage from "./pages/LoginPage";
import PartsListPage from "./pages/PartsListPage";
import PartDetailPage from "./pages/PartDetailPage";
import PartFormPage from "./pages/PartFormPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  const { authed } = useAuth();

  if (authed === null) {
    return <div className="p-8 text-center text-sm text-gray-500">読み込み中…</div>;
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<PartsListPage />} />
        <Route path="/parts/new" element={<PartFormPage mode="create" />} />
        <Route path="/parts/:id" element={<PartDetailPage />} />
        <Route path="/parts/:id/edit" element={<PartFormPage mode="edit" />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
