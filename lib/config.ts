export function requireLoginToView() {
  return process.env.REQUIRE_LOGIN_TO_VIEW !== "false";
}

export function hasSheetsConfig() {
  return Boolean(process.env.GOOGLE_SHEETS_ID);
}

export function hasAuthProviders() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getPrivateKey() {
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}
