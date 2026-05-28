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

## Google Sheet Setup

1. Upload `docs/HymnLink_data.xlsx` to Google Drive.
2. Open it with Google Sheets and save it as a native Google Sheet.
3. Confirm the tabs exist: `Hymns`, `Categories`, `Admins`, and `ChangeLog`.
4. Add authorized emails to `Admins` with role `user` or `admin`.
5. Copy the Sheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SHEET_ID/edit
```

## Google Cloud Setup

Enable these APIs in the Google Cloud project:

- Google Sheets API
- Cloud Run API
- Artifact Registry API
- Cloud Build API

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
