import type { Locale } from "@/lib/types";

export const copy = {
  zh: {
    title: "林口浸信會 HymnLink 詩歌管理系統",
    shortTitle: "HymnLink",
    subtitle: "查詢詩歌、歌詞、YouTube 與樂譜連結",
    search: "搜尋詩歌、歌詞、標籤",
    allCategories: "全部分類",
    noResults: "找不到符合條件的詩歌",
    details: "詳細資訊",
    lyrics: "歌詞",
    video: "YouTube",
    sheetMusic: "樂譜",
    metadata: "資料",
    admin: "管理",
    signIn: "登入",
    signOut: "登出",
    demoMode: "目前使用本機 Excel 種子資料。設定 Google Sheets 後即可啟用雲端讀寫。"
  },
  en: {
    title: "Linkou Baptist Church HymnLink",
    shortTitle: "HymnLink",
    subtitle: "Search hymns, lyrics, YouTube videos, and sheet music links",
    search: "Search hymns, lyrics, tags",
    allCategories: "All categories",
    noResults: "No hymns match your filters",
    details: "Details",
    lyrics: "Lyrics",
    video: "YouTube",
    sheetMusic: "Sheet music",
    metadata: "Metadata",
    admin: "Admin",
    signIn: "Sign in",
    signOut: "Sign out",
    demoMode: "Using local Excel seed data. Configure Google Sheets to enable cloud reads and writes."
  }
} as const;

export function normalizeLocale(locale?: string | null): Locale {
  return locale === "en" ? "en" : "zh";
}
