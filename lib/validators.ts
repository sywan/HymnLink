import { z } from "zod";

export const hymnInputSchema = z.object({
  id: z.string().trim().optional(),
  name_zh: z.string().trim().min(1, "中文名稱為必填"),
  name_en: z.string().trim().optional().default(""),
  album: z.string().trim().optional().default(""),
  categories: z.string().trim().optional().default(""),
  youtube_url: z.string().trim().url("YouTube 連結格式不正確").or(z.literal("")).optional().default(""),
  lyrics: z.string().trim().optional().default(""),
  sheet_music_base: z.string().trim().optional().default(""),
  sheet_music_path: z.string().trim().optional().default(""),
  composer: z.string().trim().optional().default(""),
  lyricist: z.string().trim().optional().default(""),
  tags: z.string().trim().optional().default(""),
  language: z.string().trim().optional().default(""),
  publisher: z.string().trim().optional().default(""),
  copyright_year: z.string().trim().optional().default(""),
  copyright_holder: z.string().trim().optional().default(""),
  license: z.string().trim().optional().default("")
});
