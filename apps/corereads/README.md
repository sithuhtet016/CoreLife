# CoreReads (Phase 1)

English-only AI-powered book insights app.

## Features

- Public library with search
- Book detail summary page
- Request-a-book form
- Admin login
- Admin create-book flow with optional OpenAI summary generation
- Local JSON storage for MVP (`data/books.json`, `data/requests.json`)

## Run Locally

1. Install dependencies:

```bash
npm install --prefix apps/corereads
```

2. Set env:

```bash
cp apps/corereads/.env.example apps/corereads/.env.local
```

3. Fill env values in `.env.local`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4.1-mini`)
- `COREREADS_ADMIN_PASSWORD`

4. Start:

```bash
npm run dev:corereads
```

App runs at `http://localhost:3200`.
