import { sheets } from "@googleapis/sheets";
import { GoogleAuth } from "google-auth-library";
import { getPrivateKey, hasSheetsConfig } from "@/lib/config";
import { loadSeedData } from "@/lib/seed";
import { HYMN_HEADERS, type AdminRecord, type Category, type Hymn, type HymnInput } from "@/lib/types";

export type AccessRole = "admin" | "user";

const CATEGORIES_HEADERS: (keyof Category)[] = ["code", "name_zh", "name_en"];
const ADMINS_HEADERS: (keyof AdminRecord)[] = ["email", "role", "display_name"];

function rowToRecord<T extends Record<string, string>>(headers: readonly (keyof T)[], values: unknown[]): T {
  return headers.reduce((record, header, index) => {
    record[header] = String(values[index] ?? "").trim() as T[keyof T];
    return record;
  }, {} as T);
}

function recordToRow<T extends Record<string, string>>(headers: readonly (keyof T)[], record: T) {
  return headers.map((header) => record[header] ?? "");
}

async function getSheetsClient() {
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if ((serviceAccountEmail && !privateKey) || (!serviceAccountEmail && privateKey)) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY must be configured together.");
  }

  const auth =
    serviceAccountEmail && privateKey
      ? new GoogleAuth({
          credentials: {
            client_email: serviceAccountEmail,
            private_key: privateKey
          },
          scopes
        })
      : new GoogleAuth({ scopes });

  return sheets({ version: "v4", auth });
}

async function readRange(range: string) {
  const client = await getSheetsClient();
  const response = await client.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range
  });
  return response.data.values ?? [];
}

async function updateRange(range: string, values: string[][]) {
  const client = await getSheetsClient();
  await client.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });
}

async function appendRange(range: string, values: string[][]) {
  const client = await getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values }
  });
}

export async function getHymns(): Promise<Hymn[]> {
  if (!hasSheetsConfig()) {
    return (await loadSeedData()).hymns;
  }

  const rows = await readRange("Hymns!A2:Q");
  return rows
    .map((row) => rowToRecord<Hymn>(HYMN_HEADERS, row))
    .filter((hymn) => hymn.id || hymn.name_zh || hymn.name_en);
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSheetsConfig()) {
    return (await loadSeedData()).categories;
  }

  const rows = await readRange("Categories!A2:C");
  return rows
    .map((row) => rowToRecord<Category>(CATEGORIES_HEADERS, row))
    .filter((category) => category.code && !category.code.startsWith("←"));
}

export async function getAdmins(): Promise<AdminRecord[]> {
  if (!hasSheetsConfig()) {
    return (await loadSeedData()).admins;
  }

  const rows = await readRange("Admins!A2:C");
  return rows
    .map((row) => rowToRecord<AdminRecord>(ADMINS_HEADERS, row))
    .filter((admin) => admin.email);
}

export async function getHymn(id: string) {
  return (await getHymns()).find((hymn) => hymn.id === id);
}

function normalizeRole(role?: string | null): AccessRole | null {
  const normalized = role?.trim().toLowerCase();
  return normalized === "admin" || normalized === "user" ? normalized : null;
}

export async function getAccessRole(email?: string | null): Promise<AccessRole | null> {
  if (!email) return null;
  const admins = await getAdmins();
  const record = admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase());
  return normalizeRole(record?.role);
}

export async function isAuthorizedUser(email?: string | null) {
  return Boolean(await getAccessRole(email));
}

export async function isAdmin(email?: string | null) {
  return (await getAccessRole(email)) === "admin";
}

export async function upsertHymn(input: HymnInput, actorEmail: string) {
  if (!hasSheetsConfig()) {
    throw new Error("Google Sheets is not configured. Admin writes are disabled in local seed mode.");
  }

  const hymns = await getHymns();
  const existingIndex = input.id ? hymns.findIndex((hymn) => hymn.id === input.id) : -1;
  const id = input.id || nextHymnId(hymns);
  const hymn: Hymn = { ...emptyHymn(), ...input, id };

  if (existingIndex >= 0) {
    const rowNumber = existingIndex + 2;
    const before = hymns[existingIndex];
    await updateRange(`Hymns!A${rowNumber}:Q${rowNumber}`, [recordToRow(HYMN_HEADERS, hymn)]);
    await appendChangeLog(actorEmail, "update", id, `Updated ${hymn.name_zh || hymn.name_en}`, before, hymn);
    return hymn;
  }

  await appendRange("Hymns!A:Q", [recordToRow(HYMN_HEADERS, hymn)]);
  await appendChangeLog(actorEmail, "create", id, `Created ${hymn.name_zh || hymn.name_en}`, null, hymn);
  return hymn;
}

export async function deleteHymn(id: string, actorEmail: string) {
  if (!hasSheetsConfig()) {
    throw new Error("Google Sheets is not configured. Admin writes are disabled in local seed mode.");
  }

  const hymns = await getHymns();
  const existingIndex = hymns.findIndex((hymn) => hymn.id === id);
  if (existingIndex < 0) return;

  const rowNumber = existingIndex + 2;
  const before = hymns[existingIndex];
  await updateRange(`Hymns!A${rowNumber}:Q${rowNumber}`, [recordToRow(HYMN_HEADERS, emptyHymn(id))]);
  await appendChangeLog(actorEmail, "delete", id, `Deleted ${before.name_zh || before.name_en}`, before, null);
}

function nextHymnId(hymns: Hymn[]) {
  const max = hymns.reduce((value, hymn) => Math.max(value, Number.parseInt(hymn.id, 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
}

function emptyHymn(id = ""): Hymn {
  return {
    id,
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
}

async function appendChangeLog(
  actorEmail: string,
  action: "create" | "update" | "delete",
  hymnId: string,
  summary: string,
  before: Hymn | null,
  after: Hymn | null
) {
  await appendRange("ChangeLog!A:G", [
    [
      new Date().toISOString(),
      actorEmail,
      action,
      hymnId,
      summary,
      before ? JSON.stringify(before) : "",
      after ? JSON.stringify(after) : ""
    ]
  ]);
}
