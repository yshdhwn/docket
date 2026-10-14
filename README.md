# Docket (factcheck-web)

A React + TypeScript web app for fact-checking images, videos and URLs.

## Run locally
```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
```

## Structure
- `src/pages` – Analyze (home), History, About
- `src/components` – upload, result and common UI pieces
- `src/hooks/useFactCheck.ts` – loading/success/error state machine
- `src/services/factCheckService.ts` – analysis + history storage
- `src/types/factCheck.ts` – shared types
- `src/utils/validation.ts` – file and URL validation

## Status
Image, video and URL checks are **real** when `VITE_REAL_IMAGE_API=true`. The browser calls the
serverless function `api/factcheck/[kind].ts`, which asks Google Gemini for a verdict, confidence,
summary and a **point-by-point list of reasons** ("Why this verdict").
Needs `GEMINI_API_KEY` on the server (see `.env.example`).

- **Image:** downscaled in the browser, sent to Gemini (vision).
- **Video:** 8 evenly spaced frames are extracted in the browser and sent (audio is not analysed).
- **URL:** the server fetches the page (public http/https only; private and internal addresses are blocked)
  and sends its text to Gemini. Gemini cannot browse, so it judges from the page content and general knowledge.
- Without the flag, the mock pipeline runs and results are labelled "sample data".
- If a Gemini model is overloaded (503), the function retries and falls back to other stable models.
- Local testing of the serverless function: `npx vercel dev` (plain `npm run dev` does not serve `/api`).

## Deployment
Vercel (`vercel.json` builds with Vite and rewrites all routes to `index.html`).
