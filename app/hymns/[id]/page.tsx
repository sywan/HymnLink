import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Edit3, ExternalLink, Music } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireLoginToView } from "@/lib/config";
import { getCategories, getHymn, isAdmin } from "@/lib/sheets";
import { formatEscapedText } from "@/lib/text";
import { getYouTubeEmbedUrl, joinSheetMusicUrl } from "@/lib/youtube";

function splitTokens(value: string) {
  return value
    .split(/[|｜,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function HymnDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (requireLoginToView() && !session) {
    redirect("/api/auth/signin");
  }

  const [hymn, categories, allowedToEdit] = await Promise.all([
    getHymn(params.id),
    getCategories(),
    isAdmin(session?.user?.email)
  ]);
  if (!hymn) notFound();

  const embedUrl = getYouTubeEmbedUrl(hymn.youtube_url);
  const sheetMusicUrl = joinSheetMusicUrl(hymn.sheet_music_base, hymn.sheet_music_path);
  const lyrics = formatEscapedText(hymn.lyrics);
  const categoryLabels = splitTokens(hymn.categories).map((code) => {
    const category = categories.find((item) => item.code === code);
    return category?.name_zh || category?.name_en || code;
  });

  const metadata = [
    ["英文名稱", hymn.name_en],
    ["專輯", hymn.album],
    ["作詞", hymn.lyricist],
    ["作曲", hymn.composer],
    ["分類", categoryLabels.join("｜")],
    ["標籤", hymn.tags],
    ["語言", hymn.language],
    ["出版商", hymn.publisher],
    ["版權年份", hymn.copyright_year],
    ["版權擁有者", hymn.copyright_holder],
    ["授權", hymn.license]
  ].filter(([, value]) => value);

  return (
    <>
      <section className="hero">
        <a className="button" href="/">
          <ArrowLeft size={16} />
          回詩歌列表
        </a>
        {allowedToEdit ? (
          <a className="button primary" href={`/admin/hymns/${hymn.id}`}>
            <Edit3 size={16} />
            編輯
          </a>
        ) : null}
        <h1>{hymn.name_zh || hymn.name_en}</h1>
        <p>#{hymn.id}</p>
        <div className="pillRow">
          {categoryLabels.map((label) => (
            <span className="pill" key={label}>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="detailLayout">
        <article className="panel">
          <h2>歌詞</h2>
          {lyrics ? <pre className="lyrics">{lyrics}</pre> : <p>尚未填入歌詞。</p>}
        </article>

        <aside style={{ display: "grid", gap: 16 }}>
          {embedUrl ? (
            <section className="panel">
              <h3>YouTube</h3>
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="videoFrame"
                src={embedUrl}
                title={`${hymn.name_zh || hymn.name_en} YouTube`}
              />
            </section>
          ) : null}

          {sheetMusicUrl ? (
            <section className="panel">
              <h3>樂譜</h3>
              <a className="button primary" href={sheetMusicUrl} rel="noreferrer" target="_blank">
                <Music size={16} />
                開啟樂譜
                <ExternalLink size={14} />
              </a>
            </section>
          ) : null}

          <section className="panel">
            <h3>資料</h3>
            <dl className="metaList">
              {metadata.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </section>
    </>
  );
}
