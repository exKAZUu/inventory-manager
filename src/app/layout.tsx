import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { isLoggedIn } from "@/lib/session";

export const metadata: Metadata = {
  title: "在庫管理",
  description: "部品在庫の管理",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logged = await isLoggedIn();
  return (
    <html lang="ja">
      <body className="min-h-screen">
        {logged && <Nav />}
        <main className={logged ? "pb-20 sm:pb-6 sm:pl-56" : ""}>{children}</main>
      </body>
    </html>
  );
}
