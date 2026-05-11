import type { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  loggedIn?: boolean;
};

export const sessionOptions: SessionOptions = {
  cookieName: "inv_session",
  password:
    process.env.SESSION_SECRET ??
    "fallback-insecure-secret-please-set-SESSION_SECRET-env-var",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isLoggedIn() {
  const s = await getSession();
  return Boolean(s.loggedIn);
}
