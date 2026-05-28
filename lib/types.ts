export type Locale = "zh" | "en";

export type Hymn = {
  id: string;
  name_zh: string;
  name_en: string;
  album: string;
  categories: string;
  youtube_url: string;
  lyrics: string;
  sheet_music_base: string;
  sheet_music_path: string;
  composer: string;
  lyricist: string;
  tags: string;
  language: string;
  publisher: string;
  copyright_year: string;
  copyright_holder: string;
  license: string;
};

export type Category = {
  code: string;
  name_zh: string;
  name_en: string;
};

export type AdminRecord = {
  email: string;
  role: string;
  display_name: string;
};

export type SeedData = {
  hymns: Hymn[];
  categories: Category[];
  admins: AdminRecord[];
};

export type HymnInput = Omit<Hymn, "id"> & {
  id?: string;
};

export const HYMN_HEADERS: (keyof Hymn)[] = [
  "id",
  "name_zh",
  "name_en",
  "album",
  "categories",
  "youtube_url",
  "lyrics",
  "sheet_music_base",
  "sheet_music_path",
  "composer",
  "lyricist",
  "tags",
  "language",
  "publisher",
  "copyright_year",
  "copyright_holder",
  "license"
];
