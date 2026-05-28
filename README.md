# HymnLink

林口浸信會詩歌管理系統。Production is designed for Google Cloud Run with Google login and a private Google Sheet as the data source.

## Access Model

HymnLink uses the `Admins` tab in the Google Sheet as the access allowlist.

| role | Access |
| --- | --- |
| `user` | Login, search, and view hymn details |
| `admin` | Everything a user can do, plus create, edit, delete, and use admin pages |

Required `Admins` columns:

```text
email, role, display_name
```

Users should not receive direct Google Drive access to the Sheet. Share the Sheet only with the Cloud Run runtime service account as Editor.

## Local Development

```bash
npm install
npm run generate:seed
npm run dev
```

Open `http://localhost:3000`.

For local seed browsing without login, keep this in `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret-change-before-production
REQUIRE_LOGIN_TO_VIEW=false
```

Local seed data is generated from `docs/HymnLink_data.xlsx` into `data/seed.json`. Production should use Google Sheets instead of local seed data.

## Local Testing Options

There are three useful local modes. Choose only one at a time.

### Option A: Local Seed, No Login

Use this for fast UI/data review before OAuth or Google Sheets is ready.

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret-change-before-production
REQUIRE_LOGIN_TO_VIEW=false
```

Data source:

```text
docs/HymnLink_data.xlsx -> npm run generate:seed -> data/seed.json -> app
```

After changing `docs/HymnLink_data.xlsx`, run:

```bash
npm run generate:seed
npm run dev
```

### Option B: Local Google Login With Local Seed

Use this to test Google OAuth and the `Admins` allowlist before connecting live Google Sheets.

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret-change-before-production
REQUIRE_LOGIN_TO_VIEW=true
GOOGLE_CLIENT_ID=your-local-oauth-client-id
GOOGLE_CLIENT_SECRET=your-local-oauth-client-secret
```

Add the login email to the `Admins` sheet in `docs/HymnLink_data.xlsx`, then regenerate seed data:

```text
email, role, display_name
your_email@gmail.com, admin, Your Name
```

```bash
npm run generate:seed
npm run dev
```

If a Google account is not listed in `Admins` with role `user` or `admin`, HymnLink shows the access denied page.

### Option C: Local Google Login With Live Google Sheet

Use this when testing the production data workflow from a Mac before deploying Cloud Run.

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-development-secret-change-before-production
REQUIRE_LOGIN_TO_VIEW=true
GOOGLE_CLIENT_ID=your-local-oauth-client-id
GOOGLE_CLIENT_SECRET=your-local-oauth-client-secret
GOOGLE_SHEETS_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=local-service-account@PROJECT_ID.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Share the Google Sheet with the local service account email as Editor.

This is easy to switch to production later. In Cloud Run, remove the key-based fallback variables and attach a runtime service account instead:

```text
Do not set GOOGLE_SERVICE_ACCOUNT_EMAIL in production Cloud Run.
Do not set GOOGLE_PRIVATE_KEY in production Cloud Run.
Share the Sheet with hymnlink-runner@PROJECT_ID.iam.gserviceaccount.com.
```

## Google Sheet Setup

1. Upload `docs/HymnLink_data.xlsx` to Google Drive.
2. Open it with Google Sheets and save it as a native Google Sheet.
3. Confirm the tabs exist: `Hymns`, `Categories`, `Admins`, and `ChangeLog`.
4. Add authorized emails to `Admins` with role `user` or `admin`.
5. Copy the Sheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SHEET_ID/edit
```

After `GOOGLE_SHEETS_ID` is set, the live app reads from Google Sheets. Changes to `docs/HymnLink_data.xlsx` will not appear in the app unless you intentionally return to local seed mode and run `npm run generate:seed`.

## Google Cloud Setup

Enable these APIs in the Google Cloud project:

- Google Sheets API
- Cloud Run API
- Artifact Registry API
- Cloud Build API
- Secret Manager API

Create a runtime service account, for example:

```bash
gcloud iam service-accounts create hymnlink-runner \
  --display-name="HymnLink Cloud Run runtime"
```

Share the Google Sheet with this service account email as Editor:

```text
hymnlink-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Cloud Run uses Application Default Credentials from this service account. Do not set `GOOGLE_PRIVATE_KEY` in production unless you intentionally need the local fallback pattern.

## Google OAuth

Create an OAuth client in Google Cloud Console:

- Application type: Web application
- Authorized redirect URI:

```text
https://YOUR_CUSTOM_DOMAIN/api/auth/callback/google
```

For local testing, also add:

```text
http://localhost:3000/api/auth/callback/google
```

Local OAuth setup notes:

1. In Google Cloud Console, open Google Auth Platform.
2. Configure Branding with app name `HymnLink`, a support email, and developer contact email.
3. Keep the app in testing mode while developing.
4. Add yourself as a test user under Audience.
5. Create a Web application OAuth client.
6. Add authorized JavaScript origin `http://localhost:3000`.
7. Add authorized redirect URI `http://localhost:3000/api/auth/callback/google`.
8. Copy the client ID and client secret into `.env.local`.

## Production Environment

Required Cloud Run environment variables:

```env
NEXTAUTH_URL=https://YOUR_CUSTOM_DOMAIN
NEXTAUTH_SECRET=generate-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_SHEETS_ID=your-google-sheet-id
REQUIRE_LOGIN_TO_VIEW=true
```

Optional local/dev fallback only:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Recommended Secret Manager setup:

```bash
printf "YOUR_NEXTAUTH_SECRET" | gcloud secrets create NEXTAUTH_SECRET --data-file=-
printf "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
printf "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
```

## Deploy To Cloud Run

Build and deploy from the repository root:

```bash
gcloud run deploy hymnlink \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --service-account hymnlink-runner@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars NEXTAUTH_URL=https://YOUR_CUSTOM_DOMAIN,REQUIRE_LOGIN_TO_VIEW=true,GOOGLE_SHEETS_ID=YOUR_SHEET_ID \
  --set-secrets NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest
```

Cloud Run should allow unauthenticated HTTP traffic because HymnLink enforces Google login inside the app.

After deployment:

1. Map the custom domain to the Cloud Run service.
2. Update `NEXTAUTH_URL` to the custom domain.
3. Confirm the Google OAuth redirect URI uses the same custom domain.
4. Test with one `user`, one `admin`, and one unlisted Google account.

## Verification Checklist

```bash
npm run build
```

Expected behavior:

- `REQUIRE_LOGIN_TO_VIEW=false`: local seed browsing works without login.
- Signed-out production users are sent to Google login.
- Unlisted Google accounts see the access denied page.
- `role=user` can view hymns but cannot write.
- `role=admin` can create, edit, delete, and write `ChangeLog`.
- Cloud Run starts on `$PORT` and reads/writes the Sheet through the runtime service account.

## Troubleshooting Notes

### Access Denied After Google Login

Meaning: OAuth succeeded, but the Google email is not allowed by HymnLink.

Fix:

1. Add the email to the `Admins` tab.
2. Set `role` to `user` or `admin`.
3. If using local seed mode, run `npm run generate:seed`.
4. Restart the dev server.

### Blank Page After Clicking Login

Likely meaning: Google OAuth is not configured yet, or the OAuth redirect URI does not match the current URL.

For local OAuth, confirm:

```text
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI: http://localhost:3000/api/auth/callback/google
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID is set
GOOGLE_CLIENT_SECRET is set
```

For local browsing before OAuth is ready, set:

```env
REQUIRE_LOGIN_TO_VIEW=false
```

### Server Error After Auth Or Build Changes

If the browser shows a stale Next.js server error after code changes:

```bash
killall node
rm -rf .next
npm run dev
```

Then hard refresh the browser:

```text
Command + Shift + R
```

### Google Sheet Versus Excel Source

Once `GOOGLE_SHEETS_ID` is configured:

```text
Google Sheet -> HymnLink app
```

The Excel file remains useful as a backup or local seed source:

```text
docs/HymnLink_data.xlsx -> npm run generate:seed -> local fallback app
```

Do not expect Excel edits to affect the live app after switching to Google Sheets.

## Cost Notes

Cloud Run should usually be free or near-free for church-scale HymnLink usage if configured with:

```text
Minimum instances: 0
Request-based billing
No always-on background jobs
Small memory allocation, such as 512 MiB
No large media files served from Cloud Run
```

Set Google Cloud budget alerts, for example:

```text
$1 monthly warning
$5 monthly critical
```

Avoid setting minimum instances to `1` unless you intentionally accept possible always-on cost.
