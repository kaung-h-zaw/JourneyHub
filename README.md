# JourneyHub

JourneyHub is a Vite + React travel planner that builds simple day-by-day trip plans, maps trip stops, saves trips locally, and exports printable PDFs.

## Deploy-safe env setup

This project now expects server-side environment variables for Vercel functions:

```bash
GROQ_API_KEY=...
AMADEUS_API_KEY=...
AMADEUS_API_SECRET=...
```

Do not use `VITE_` prefixes for secrets.

## Local development

Frontend only:

```bash
npm install
npm run dev
```

For local testing of the serverless routes, use Vercel dev:

```bash
vercel dev
```

## Build

```bash
npm run build
```

## Vercel

Set these environment variables in the Vercel project settings:

- `GROQ_API_KEY`
- `AMADEUS_API_KEY`
- `AMADEUS_API_SECRET`

The app uses:

- `/api/groq` for trip plan generation
- `/api/amadeus/search` for Amadeus requests
- `/api/amadeus/token` for token checks if needed

## Before pushing

1. Rotate any keys that were previously exposed.
2. Keep `.env` out of git.
3. Verify the Vercel env vars are set with the non-`VITE_` names above.
