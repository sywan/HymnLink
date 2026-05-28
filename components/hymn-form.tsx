"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import type { Hymn } from "@/lib/types";

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

export function HymnForm({ hymn }: { hymn?: Hymn }) {
  const [form, setForm] = useState<Hymn>(hymn ?? emptyHymn);
  const [status, setStatus] = useState("");
  const isExisting = Boolean(form.id);

  function update(name: keyof Hymn, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
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
      <h2>{isExisting ? "編輯詩歌" : "新增詩歌"}</h2>
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
          <span>分類代碼（以 ｜ 分隔）</span>
          <input className="input" value={form.categories} onChange={(event) => update("categories", event.target.value)} />
        </label>
        <label className="field">
          <span>專輯</span>
          <input className="input" value={form.album} onChange={(event) => update("album", event.target.value)} />
        </label>
        <label className="field">
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
        <label className="field">
          <span>作曲</span>
          <input className="input" value={form.composer} onChange={(event) => update("composer", event.target.value)} />
        </label>
        <label className="field">
          <span>作詞</span>
          <input className="input" value={form.lyricist} onChange={(event) => update("lyricist", event.target.value)} />
        </label>
        <label className="field wide">
          <span>標籤</span>
          <input className="input" value={form.tags} onChange={(event) => update("tags", event.target.value)} />
        </label>
        <label className="field wide">
          <span>歌詞</span>
          <textarea className="textarea" value={form.lyrics} onChange={(event) => update("lyrics", event.target.value)} />
        </label>
      </div>
      <div className="navActions" style={{ justifyContent: "flex-start", marginTop: 16 }}>
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
        <span>{status}</span>
      </div>
    </section>
  );
}
