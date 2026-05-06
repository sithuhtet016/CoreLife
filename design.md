# CoreLife Design Document

## 1. Purpose
CoreLife is a full-stack web app for personal life assessment, habit tracking, and progress analytics. The system is designed as a React SPA backed by an Express API and Supabase (Auth + Postgres).

Primary product flows:
- Account onboarding with email verification
- Guided 3-step life assessment
- Habit creation and daily/weekly tracking
- Progress dashboard, history, and recommendations

## 2. High-Level Architecture
- Frontend (`client`): React 19 + TypeScript + Vite SPA
- Backend (`server`): Express 4 (ES modules) API + static client hosting in production
- Data/Auth: Supabase Auth + Supabase Postgres
- Email: Mailtrap API for transactional emails (welcome + login OTP)

Runtime model:
1. Browser loads SPA routes.
2. Frontend authenticates with Supabase Auth.
3. Frontend calls backend `/api/*` with Bearer access token.
4. Backend validates token via Supabase, then reads/writes Postgres tables via Supabase client.
5. Backend computes scoring, progress comparisons, habit metrics, and recommendation payloads.

## 3. Frontend Design
### 3.1 Routing and Access Control
Defined in `client/src/App.tsx`:
- Public routes: `/`, `/login`, `/register`, `/reset-password`, `/legal`, `/assessment*`
- Protected routes: `/dashboard`, `/habit-tracker`, `/progress-analytics`, `/results`
- `RequireAuth` blocks unauthenticated users.
- `RequireCompletedAssessment` blocks access to dashboard pages until at least one completed assessment exists.

### 3.2 Auth Session and Token Strategy
Implemented in `client/src/supabase.ts` and `client/src/api.ts`:
- Supabase client persists auth session with dynamic storage.
- “Remember me” toggles storage mode:
  - `localStorage` for persistent session
  - `sessionStorage` for tab/session-only session
- Access token is also mirrored under `corelife_token` and used for backend API Authorization headers.
- Startup/session sync uses `syncStoredTokenFromSession()` to keep API token aligned with Supabase session.

### 3.3 API Client Layer
`client/src/api.ts` centralizes:
- auth actions (register/login/logout/password reset)
- 2FA login challenge/verify flow
- assessment lifecycle (start/save/submit/current/draft)
- habit CRUD + log updates
- progress comparison/history
- recommendations

The request helper:
- injects `Authorization: Bearer <token>` when available
- normalizes JSON/non-JSON responses
- throws meaningful errors for UI display

## 4. Backend Design
### 4.1 API Host and Middleware
`server/src/server.js` configures:
- `helmet` with CSP (including Supabase + Plotly CDN allowances)
- `cors`
- `express.json()`
- rate limiting (`15 min / 300 requests`)

The same server also serves built frontend assets from `client/dist` and falls back to `index.html` for SPA routes.

### 4.2 Authentication and Authorization
- Bearer tokens are validated against Supabase user info.
- `requireAuth` middleware protects private endpoints.
- Most data access is scoped by `req.user.id`.
- Server uses:
  - `supabaseAuth` client (anon key)
  - `supabaseAdmin` client (service role preferred, anon fallback with warning)

### 4.3 Core Domain Services
Assessment:
- Reference data: `life_areas`, `questions`
- Session lifecycle: start, save answers, submit, resume current
- Submission computes per-area and overall percentage score
- Metadata captured: age, primary goal, selected areas, confidence, priorities, time commitment

Habits:
- CRUD habits by life area and frequency (`daily`/`weekly`)
- Daily completion via upsert to `habit_logs`
- Derived metrics: streak, longest streak, weekly consistency, completed today

Progress:
- Comparison endpoint computes deltas between latest and previous completed assessments
- History endpoint returns completed assessment timeline

Recommendations:
- Rule-based library in server code
- Latest completed assessment determines low-scoring area focus
- Falls back to general recommendations if no targeted matches

Promotions and Email:
- Promotional subscriber upsert endpoint
- Welcome and login OTP emails via Mailtrap API

## 5. Database Design (Supabase Postgres)
Schema source: `server/supabase/schema.sql`

Main entities:
- `users`: app profile mirror for auth users
- `promotional_subscribers`: marketing opt-ins
- `login_otp_challenges`: server-managed second-factor login challenges
- `life_areas`: 12 fixed dimensions
- `questions`: assessment questions per life area
- `assessment_sessions`: in-progress/completed assessment state + computed scores
- `assessment_drafts`: saved step draft (`step`, `route`, JSON payload)
- `answers`: per-session question scores (1-5)
- `habits`: user habits
- `habit_logs`: per-day completion records

Design characteristics:
- UUID primary keys for user/content tables
- Referential integrity via foreign keys + cascade rules
- Constraints for validity (score range, confidence range, frequency enum-like checks)
- Upsert patterns used for idempotent writes (drafts, habit logs, subscribers)

## 6. Key Flows
### 6.1 Registration
1. Frontend calls `supabase.auth.signUp()` with user metadata.
2. User verifies email OTP (Supabase verifyOtp).
3. Backend profile is ensured (`users` table) when authenticated flows run.
4. Optional promotional subscription is synced.

### 6.2 Login with OTP Challenge
1. Frontend starts challenge via `/api/auth/login/2fa/start` (email + password).
2. Backend validates credentials with Supabase and stores hashed OTP challenge.
3. User submits code to `/api/auth/login/2fa/verify`.
4. Backend verifies attempts/expiry and returns tokens.
5. Frontend sets Supabase session and local API token.

### 6.3 Assessment Submission
1. Start or resume session.
2. Save answers incrementally.
3. Submit when all required answers exist.
4. Backend computes `area_scores` and `overall_score`, marks session completed.
5. Results/progress pages consume comparison/history endpoints.

### 6.4 Habit Tracking
1. Create habits tied to life areas.
2. Toggle daily/weekly completion by date.
3. Backend returns enriched metrics and weekly summary arrays for UI analytics.

## 7. Security and Reliability Notes
- Helmet + CSP + rate limiting are enabled.
- Auth is token-based; private endpoints require valid bearer token.
- Input normalization/validation exists for dates, lists, metadata, and score bounds.
- Service role key is optional but recommended; anon fallback is less privileged for admin-like writes.
- Static assets are cached aggressively; HTML shell is no-cache for SPA updates.

## 8. Deployment Model
- Render single web service model is supported.
- Build installs root/client/server dependencies and builds the client.
- Runtime starts Express server, which serves both API and SPA from one domain.
- Required env vars include Supabase keys/URL and Mailtrap settings.

## 9. Current Architectural Tradeoffs
- Recommendation engine is rule-based in code (simple and fast, but static).
- A lightweight access-token mirror (`corelife_token`) coexists with Supabase session storage for API calls.
- Backend handles most domain aggregation/metrics, simplifying frontend state logic.
- Debug endpoints exist behind `ENABLE_DEBUG_ENDPOINTS` and should remain disabled in production.
