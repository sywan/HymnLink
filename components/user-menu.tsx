"use client";

import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, Settings } from "lucide-react";

export function UserMenu({ session }: { session: Session | null }) {
  return (
    <nav className="navActions" aria-label="Primary">
      {session?.user?.role === "admin" ? (
        <a className="button" href="/admin">
          <Settings size={16} />
          管理
        </a>
      ) : null}
      {session?.user ? (
        <button className="button" type="button" onClick={() => signOut()}>
          <LogOut size={16} />
          登出
        </button>
      ) : (
        <button className="button primary" type="button" onClick={() => signIn()}>
          <LogIn size={16} />
          登入
        </button>
      )}
    </nav>
  );
}
