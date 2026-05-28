import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const workbookPath = path.resolve("docs/HymnLink_data.xlsx");
const outPath = path.resolve("data/seed.json");

if (!fs.existsSync(workbookPath)) {
  throw new Error(`Missing source workbook: ${workbookPath}`);
}

const workbook = XLSX.readFile(workbookPath, { cellDates: false });

function sheetToJson(name) {
  const sheet = workbook.Sheets[name];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

const hymns = sheetToJson("Hymns")
  .filter((row) => String(row.id || row.name_zh || row.name_en).trim())
  .map((row) => ({
    id: String(row.id || "").trim(),
    name_zh: String(row.name_zh || "").trim(),
    name_en: String(row.name_en || "").trim(),
    album: String(row.album || "").trim(),
    categories: String(row.categories || "").trim(),
    youtube_url: String(row.youtube_url || "").trim(),
    lyrics: String(row.lyrics || "").trim(),
    sheet_music_base: String(row.sheet_music_base || "").trim(),
    sheet_music_path: String(row.sheet_music_path || "").trim(),
    composer: String(row.composer || "").trim(),
    lyricist: String(row.lyricist || "").trim(),
    tags: String(row.tags || "").trim(),
    language: String(row.language || "").trim(),
    publisher: String(row.publisher || "").trim(),
    copyright_year: String(row.copyright_year || "").trim(),
    copyright_holder: String(row.copyright_holder || "").trim(),
    license: String(row.license || "").trim()
  }));

const categories = sheetToJson("Categories")
  .filter((row) => String(row.code || row.name_zh || row.name_en).trim())
  .map((row) => ({
    code: String(row.code || "").trim(),
    name_zh: String(row.name_zh || "").trim(),
    name_en: String(row.name_en || "").trim()
  }))
  .filter((row) => row.code && !row.code.startsWith("←"));

const admins = sheetToJson("Admins")
  .filter((row) => String(row.email || row.role).trim())
  .map((row) => ({
    email: String(row.email || "").trim().toLowerCase(),
    role: String(row.role || "user").trim().toLowerCase(),
    display_name: String(row.display_name || "").trim()
  }));

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify({ hymns, categories, admins }, null, 2)}\n`);

console.log(`Wrote ${hymns.length} hymns, ${categories.length} categories, ${admins.length} admin rows to ${outPath}`);
