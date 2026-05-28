import { LogIn, ShieldAlert } from "lucide-react";

type AuthErrorPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const accessDenied = searchParams?.error === "AccessDenied";

  return (
    <section className="authPanel">
      <div className="authIcon">
        <ShieldAlert size={28} />
      </div>
      <h1>{accessDenied ? "無法登入 HymnLink" : "登入時發生問題"}</h1>
      <p>
        {accessDenied
          ? "這個 Google 帳號尚未列在 Admins 工作表中。請聯絡系統管理員加入 email 並指定 user 或 admin 角色。"
          : "請稍後再試，或改用已授權的 Google 帳號登入。"}
      </p>
      <div className="buttonRow">
        <a className="button primary" href="/api/auth/signin">
          <LogIn size={16} />
          重新登入
        </a>
        <a className="button" href="/">
          回首頁
        </a>
      </div>
    </section>
  );
}
