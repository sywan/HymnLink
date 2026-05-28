# HymnLink
<<<<<<< HEAD
Lin Kou Baptist Church Hymn Management System
=======

林口浸信會 HymnLink 詩歌管理系統。

This first build is designed for a free-tier, low-maintenance setup:

- Next.js app deployable on Vercel free tier.
- Google Sheets as the single source of truth for `Hymns`, `Categories`, `Admins`, and `ChangeLog`.
- Google / GitHub OAuth through NextAuth.
- Local Excel seed mode from `docs/HymnLink_data.xlsx` for development before cloud credentials are ready.

## Local Development

```bash
npm install
npm run generate:seed
npm run dev
```

Open `http://localhost:3000`.

Without OAuth credentials, the app allows local seed-data browsing so the interface can be reviewed immediately. Once Google or GitHub OAuth is configured, browsing follows `REQUIRE_LOGIN_TO_VIEW` and defaults to requiring login unless explicitly set to `false`.

## Environment

Copy `.env.example` to `.env.local` and fill in the values.

Required for production browsing with login:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and optionally `GITHUB_ID` / `GITHUB_SECRET`

Required for Google Sheets reads and admin writes:

- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

Share the Google Sheet with the service account email as an editor.

## Spreadsheet Contract

The app expects the workbook tabs and headers from `docs/HymnLink_data.xlsx`:

- `Hymns`: hymn catalog
- `Categories`: category vocabulary
- `Admins`: admin email list
- `ChangeLog`: audit trail written by the app

Admin permissions are granted only when an authenticated user's email appears in `Admins` with `role` set to `admin`.

## Deployment

1. Upload `docs/HymnLink_data.xlsx` to Google Drive and convert it to Google Sheets.
2. Enable Google Sheets API in Google Cloud.
3. Create a service account and share the Sheet with the service account email.
4. Create Google OAuth credentials and add the Vercel callback URL:
   `https://YOUR_DOMAIN/api/auth/callback/google`
5. Add the environment variables in Vercel.
6. Deploy from GitHub or the Vercel CLI.
>>>>>>> 706af08 (Initial HymnLink app scaffold)
