import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { HymnForm } from "@/components/hymn-form";
import { authOptions } from "@/lib/auth";
import { hasSheetsConfig } from "@/lib/config";
import { getCategories, getHymns, isAdmin } from "@/lib/sheets";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const allowed = await isAdmin(session?.user?.email);
  if (!allowed) redirect(session ? "/auth/error?error=AccessDenied" : "/api/auth/signin");

  const [hymns, categories] = await Promise.all([getHymns(), getCategories()]);

  return (
    <>
      <section className="hero">
        <h1>詩歌管理</h1>
        <p>新增、修改、刪除詩歌資料。所有寫入操作都會同步到 Google Sheets 並記錄 ChangeLog。</p>
      </section>

      {!hasSheetsConfig() ? (
        <section className="notice" style={{ marginBottom: 16 }}>
          目前尚未設定 Google Sheets 環境變數，因此管理寫入已停用。設定完成後即可使用此頁面維護資料。
        </section>
      ) : null}

      <HymnForm categories={categories} />

      <section className="panel" style={{ marginTop: 20 }}>
        <h2>現有詩歌</h2>
        <table className="adminTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>中文名稱</th>
              <th>分類</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {hymns.slice(0, 100).map((hymn) => (
              <tr key={hymn.id}>
                <td>{hymn.id}</td>
                <td>{hymn.name_zh || hymn.name_en}</td>
                <td>{hymn.categories}</td>
                <td>
                  <a className="button" href={`/admin/hymns/${hymn.id}`}>
                    編輯
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
