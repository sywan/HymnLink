"use client";

import { useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Category, Hymn } from "@/lib/types";

const emptyHymn: Hymn = {
  id: "",
  name_zh: "",
  name_en: "",
  album: "",
  categories: "",
  youtube_url: "",
  lyrics: "",
  sheet_music_base: "",
  sheet_music_path: "",
  composer: "",
  lyricist: "",
  tags: "",
  language: "",
  publisher: "",
  copyright_year: "",
  copyright_holder: "",
  license: ""
};

function splitTokens(value: string) {
  return value
    .split(/[|｜,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function HymnForm({
  hymn,
  categories = [],
  returnHref = "/admin"
}: {
  hymn?: Hymn;
  categories?: Category[];
  returnHref?: string;
}) {
  const [form, setForm] = useState<Hymn>(hymn ?? emptyHymn);
  const [status, setStatus] = useState("");
  const isExisting = Boolean(form.id);

  function update(name: keyof Hymn, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleCategory(code: string) {
    const current = splitTokens(form.categories);
    const next = current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
    update("categories", next.join("|"));
  }

  async function save() {
    setStatus("儲存中...");
    const response = await fetch("/api/hymns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "儲存失敗");
      return;
    }
    setForm(payload.hymn);
    setStatus("已儲存");
  }

  async function remove() {
    if (!form.id || !confirm("確定刪除這首詩歌？")) return;
    setStatus("刪除中...");
    const response = await fetch(`/api/hymns/${form.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.error ?? "刪除失敗");
      return;
    }
    setForm(emptyHymn);
    setStatus("已刪除");
  }

  return (
    <section className="panel">
      <div className="formHeader">
        <div>
          <p className="eyebrow">{isExisting ? `#${form.id}` : "New hymn"}</p>
          <h2>{isExisting ? "編輯詩歌" : "新增詩歌"}</h2>
        </div>
        <a className="button" href={returnHref}>
          <ArrowLeft size={16} />
          返回
        </a>
      </div>

      <div className="editorStack">
        <section className="formSection">
          <h3>基本資料</h3>
          <div className="formGrid">
            <label className="field">
              <span>系統編號</span>
              <input className="input" value={form.id} onChange={(event) => update("id", event.target.value)} />
            </label>
            <label className="field">
              <span>中文名稱 *</span>
              <input className="input" value={form.name_zh} onChange={(event) => update("name_zh", event.target.value)} />
            </label>
            <label className="field">
              <span>英文名稱</span>
              <input className="input" value={form.name_en} onChange={(event) => update("name_en", event.target.value)} />
            </label>
            <label className="field">
              <span>語言</span>
              <input className="input" value={form.language} onChange={(event) => update("language", event.target.value)} />
            </label>
            <label className="field wide">
              <span>專輯</span>
              <input className="input" value={form.album} onChange={(event) => update("album", event.target.value)} />
            </label>
          </div>
        </section>

        <section className="formSection">
          <h3>分類與標籤</h3>
          {categories.length ? (
            <div className="checkboxGrid">
              {categories.map((category) => (
                <label className="checkOption" key={category.code}>
                  <input
                    checked={splitTokens(form.categories).includes(category.code)}
                    onChange={() => toggleCategory(category.code)}
                    type="checkbox"
                  />
                  <span>{category.name_zh || category.name_en}</span>
                </label>
              ))}
            </div>
          ) : null}
          <label className="field">
            <span>分類代碼（以 | 分隔）</span>
            <input className="input" value={form.categories} onChange={(event) => update("categories", event.target.value)} />
          </label>
          <label className="field">
            <span>標籤（以 | 分隔）</span>
            <input className="input" value={form.tags} onChange={(event) => update("tags", event.target.value)} />
          </label>
        </section>

        <section className="formSection">
          <h3>媒體與歌詞</h3>
          <div className="formGrid">
            <label className="field wide">
              <span>YouTube 連結</span>
              <input className="input" value={form.youtube_url} onChange={(event) => update("youtube_url", event.target.value)} />
            </label>
            <label className="field">
              <span>樂譜路徑</span>
              <input
                className="input"
                value={form.sheet_music_base}
                onChange={(event) => update("sheet_music_base", event.target.value)}
              />
            </label>
            <label className="field">
              <span>樂譜檔名</span>
              <input
                className="input"
                value={form.sheet_music_path}
                onChange={(event) => update("sheet_music_path", event.target.value)}
              />
            </label>
            <label className="field wide">
              <span>歌詞</span>
              <textarea className="textarea lyricEditor" value={form.lyrics} onChange={(event) => update("lyrics", event.target.value)} />
            </label>
          </div>
        </section>

        <section className="formSection">
          <h3>作者與版權</h3>
          <div className="formGrid">
            <label className="field">
              <span>作曲</span>
              <input className="input" value={form.composer} onChange={(event) => update("composer", event.target.value)} />
            </label>
            <label className="field">
              <span>作詞</span>
              <input className="input" value={form.lyricist} onChange={(event) => update("lyricist", event.target.value)} />
            </label>
            <label className="field">
              <span>出版商</span>
              <input className="input" value={form.publisher} onChange={(event) => update("publisher", event.target.value)} />
            </label>
            <label className="field">
              <span>版權年份</span>
              <input className="input" value={form.copyright_year} onChange={(event) => update("copyright_year", event.target.value)} />
            </label>
            <label className="field">
              <span>版權擁有者</span>
              <input
                className="input"
                value={form.copyright_holder}
                onChange={(event) => update("copyright_holder", event.target.value)}
              />
            </label>
            <label className="field">
              <span>授權 / CCLI</span>
              <input className="input" value={form.license} onChange={(event) => update("license", event.target.value)} />
            </label>
          </div>
        </section>
      </div>

      <div className="formActions">
        <button className="button primary" type="button" onClick={save}>
          <Save size={16} />
          儲存
        </button>
        {isExisting ? (
          <button className="button danger" type="button" onClick={remove}>
            <Trash2 size={16} />
            刪除
          </button>
        ) : null}
        {status ? <span className="statusBadge">{status}</span> : null}
      </div>
    </section>
  );
}
