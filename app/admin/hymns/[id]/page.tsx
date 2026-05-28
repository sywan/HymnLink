import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { HymnForm } from "@/components/hymn-form";
import { authOptions } from "@/lib/auth";
import { hasSheetsConfig } from "@/lib/config";
import { getCategories, getHymn, isAdmin } from "@/lib/sheets";

export default async function AdminHymnEditPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const allowed = await isAdmin(session?.user?.email);
  if (!allowed) redirect(session ? "/auth/error?error=AccessDenied" : "/api/auth/signin");

  const [hymn, categories] = await Promise.all([getHymn(params.id), getCategories()]);
  if (!hymn) notFound();

  return (
    <>
      <section className="hero compactHero">
        <h1>編輯詩歌資料</h1>
        <p>只有管理者可以進入此頁面。儲存後會寫入 Google Sheets，並由系統記錄 ChangeLog。</p>
      </section>

      {!hasSheetsConfig() ? (
        <section className="notice" style={{ marginBottom: 16 }}>
          目前尚未設定 Google Sheets 環境變數，因此管理寫入已停用。設定完成後即可使用此頁面維護資料。
        </section>
      ) : null}

      <HymnForm categories={categories} hymn={hymn} returnHref={`/hymns/${hymn.id}`} />
    </>
  );
}
