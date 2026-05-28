import type { Metadata } from "next";
import { Music2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { copy } from "@/lib/i18n";
import { hasSheetsConfig } from "@/lib/config";
import { UserMenu } from "@/components/user-menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "HymnLink | 林口浸信會",
  description: "林口浸信會詩歌管理系統"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const t = copy.zh;

  return (
    <html lang="zh-Hant">
      <body>
        <main className="shell">
          <header className="topbar">
            <a className="brand" href="/">
              <span className="brandMark" aria-hidden="true">
                <Music2 size={22} />
              </span>
              <span className="brandText">
                <strong>{t.shortTitle}</strong>
                <span>林口浸信會 詩歌管理系統</span>
              </span>
            </a>
            <UserMenu session={session} />
          </header>
          {!hasSheetsConfig() ? <div className="notice">{t.demoMode}</div> : null}
          {children}
        </main>
      </body>
    </html>
  );
}
