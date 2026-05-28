"use client";

import { useMemo, useState } from "react";
import { Search, Languages } from "lucide-react";
import { copy, normalizeLocale } from "@/lib/i18n";
import type { Category, Hymn, Locale } from "@/lib/types";

function splitTokens(value: string) {
  return value
    .split(/[|｜,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function categoryName(code: string, categories: Category[], locale: Locale) {
  const category = categories.find((item) => item.code === code);
  if (!category) return code;
  return locale === "en" ? category.name_en || category.name_zh : category.name_zh || category.name_en;
}

export function HymnExplorer({ hymns, categories }: { hymns: Hymn[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [locale, setLocale] = useState<Locale>("zh");
  const t = copy[locale];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return hymns.filter((hymn) => {
      const haystack = [
        hymn.id,
        hymn.name_zh,
        hymn.name_en,
        hymn.lyrics,
        hymn.tags,
        hymn.album,
        hymn.composer,
        hymn.lyricist
      ]
        .join(" ")
        .toLowerCase();
      const inCategory = !category || splitTokens(hymn.categories).includes(category);
      return inCategory && (!needle || haystack.includes(needle));
    });
  }, [category, hymns, query]);

  return (
    <>
      <section className="hero">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <section className="toolbar" aria-label="Search and filters">
        <label className="field">
          <span>{t.search}</span>
          <span style={{ position: "relative" }}>
            <Search aria-hidden="true" size={18} style={{ left: 12, position: "absolute", top: 13 }} />
            <input
              className="input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              style={{ paddingLeft: 40 }}
              value={query}
            />
          </span>
        </label>

        <label className="field">
          <span>{t.allCategories}</span>
          <select className="select" onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="">{t.allCategories}</option>
            {categories.map((item) => (
              <option key={item.code} value={item.code}>
                {locale === "en" ? item.name_en || item.name_zh : item.name_zh || item.name_en}
              </option>
            ))}
          </select>
        </label>

        <button
          className="button"
          type="button"
          onClick={() => setLocale((value) => normalizeLocale(value === "zh" ? "en" : "zh"))}
        >
          <Languages size={16} />
          {locale === "zh" ? "EN" : "中文"}
        </button>
      </section>

      {filtered.length ? (
        <section className="grid" aria-label="Hymns">
          {filtered.map((hymn) => (
            <a className="hymnCard" href={`/hymns/${hymn.id}`} key={hymn.id}>
              <div>
                <h2>{locale === "en" ? hymn.name_en || hymn.name_zh : hymn.name_zh || hymn.name_en}</h2>
                <p>
                  #{hymn.id}
                  {hymn.album ? ` · ${hymn.album}` : ""}
                </p>
              </div>
              <p>{hymn.lyrics ? hymn.lyrics.slice(0, 92) : hymn.tags || hymn.composer || "尚待補充詩歌資料"}</p>
              <div className="pillRow">
                {splitTokens(hymn.categories)
                  .slice(0, 3)
                  .map((code) => (
                    <span className="pill" key={code}>
                      {categoryName(code, categories, locale)}
                    </span>
                  ))}
              </div>
            </a>
          ))}
        </section>
      ) : (
        <section className="panel">{t.noResults}</section>
      )}
    </>
  );
}
