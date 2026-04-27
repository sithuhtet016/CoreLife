# CoreLife

CoreLife is an MVP web application for life assessment, habit tracking, and long-term progress comparison.

## Stack

- Frontend: React 19 + TypeScript + Vite
- Backend: Express 4 (ES Modules)
- Database target: Supabase (PostgreSQL + Auth + RLS)

## Project Structure

- `client` - React frontend
- `server` - Express API backend
- `server/supabase/schema.sql` - initial database schema and seed

## Run Locally

1. Install dependencies:
   - `npm install`
   - `npm install --prefix client`
   - `npm install --prefix server`
2. Start both servers:
   - `npm run dev`
3. Open:
   - Frontend: `http://localhost:5173`
   - API health: `http://localhost:3000/api/health`

## Deploy To Render With core-life.app

This repository is configured for a single Render web service that serves both
API routes and the built React app from one domain.

### 1. Create Web Service

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** from the repository.
3. Use `render.yaml` or configure the same commands manually:

- Build: `npm ci --include=dev && npm ci --prefix client --include=dev && npm ci --prefix server --include=dev && npm run build --prefix client`
- Start: `npm run start --prefix server`

### 2. Set Render Environment Variables

Set all required backend variables:

- `PORT` (Render usually injects this automatically)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL=https://core-life.app`
- `MAILTRAP_TOKEN`
- `MAILTRAP_FROM_EMAIL`
- `MAILTRAP_FROM_NAME`

Set required frontend build variables (in Render environment as well):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Attach Custom Domain

1. In Render service settings, open **Custom Domains**.
2. Add `core-life.app` and (recommended) `www.core-life.app`.
3. In Name.com DNS, create the records Render requests.
4. Wait for DNS propagation and SSL issuance to complete.

## Mailtrap Integration

CoreLife now supports Mailtrap for backend transactional emails (for example,
welcome emails) and can also use Mailtrap SMTP for Supabase Auth emails
(password reset, verification, magic link).

### 1. Verify Your Sending Domain In Mailtrap

1. In Mailtrap, open **Sending Domains** and select your domain.
2. Add the required DNS records (SPF/DKIM/Tracking) in your DNS provider.
3. Wait until Mailtrap shows the domain as **Verified**.

### 2. Configure Backend Transactional Emails

1. Copy `server/.env.example` to `server/.env`.
2. Fill these values:

- `MAILTRAP_TOKEN` from Mailtrap API credentials
- `MAILTRAP_FROM_EMAIL` using your verified domain sender (for example, `hello@core-life.app`)
- `MAILTRAP_FROM_NAME` optional display name
- `APP_BASE_URL` to your frontend URL

1. Restart the server.

The backend sends a welcome email after successful registration when Mailtrap is configured.

You can verify integration with:

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"to":"your@email.com"}'
```

### 3. Use Mailtrap SMTP For Supabase Auth Emails

Your frontend currently calls Supabase Auth directly for signup and password reset,
so those emails are sent by Supabase SMTP settings.

1. In Supabase Dashboard, open **Authentication** > **Settings** > **SMTP Settings**.
2. Enable custom SMTP.
3. In Mailtrap, switch to the **SMTP** tab and copy host/port/username/password.
4. Paste those into Supabase SMTP settings.
5. Set sender email/name to your verified domain values.
6. Save and send a test password-reset email from the app.

### 4. Switch Supabase Confirm Sign Up Email To OTP Content

If your registration flow asks users to enter an email OTP code, your Supabase
"Confirm sign up" template should include `{{ .Token }}` as the primary action.

1. In Supabase Dashboard, open **Authentication** > **Email** > **Confirm sign up**.
2. Subject suggestion: `Your CoreLife signup verification code`.
3. Replace the email body with the template in:

- `supabase/email-templates/confirm-sign-up-otp.html`

4. (Optional) Use the text fallback version from:

- `supabase/email-templates/confirm-sign-up-otp.txt`

5. Save changes and register with a new email to verify OTP delivery.

Note: The template still includes `{{ .ConfirmationURL }}` as a fallback link,
but OTP (`{{ .Token }}`) is the main path to match the app's OTP verification UI.

## Implemented MVP Features

- Authentication with account signup/signin (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- JWT-based protected API routes so each user only accesses their own data
- Persistent backend storage in `server/data/db.json` for users, assessments, habits, and logs
- Assessment:
  - Start/save/submit session
  - Resume in-progress session
  - Validation: all questions required before submission
  - Per-area and overall scoring
  - Weakest area highlighting
- Habits:
  - Create/list/update/delete habits
  - Daily check-ins
  - Streak and weekly consistency
- Progress:
  - Latest vs previous completed assessment comparison
  - Completed assessment history

## Notes

- The current backend stores data locally in `server/data/db.json`.
- Set `JWT_SECRET` in your server environment for production-grade token security.
- The provided SQL schema maps to the production Supabase model.
