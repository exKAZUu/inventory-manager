import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";

type SessionInfo = { authed: boolean; csrf_token: string };

type AuthContextValue = {
  authed: boolean | null;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const s = await api.get<SessionInfo>("/session");
    setAuthed(s.authed);
  }, []);

  useEffect(() => {
    refresh().catch(() => setAuthed(false));
  }, [refresh]);

  const login = useCallback(async (password: string) => {
    await api.post<SessionInfo>("/session", { password });
    setAuthed(true);
  }, []);

  const logout = useCallback(async () => {
    await api.delete<void>("/session");
    setAuthed(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authed, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
