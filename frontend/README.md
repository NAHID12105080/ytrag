# ytrag frontend

Next.js (App Router) UI for the ytrag YouTube RAG summarizer/chatbot. Talks to the
FastAPI backend in `../api` — see the repository root `README.md` for how to run both
together.

## Development

```bash
pnpm install
pnpm dev
```

Requires `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (see `.env.example`) pointing at
the running backend, default `http://localhost:8000`.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint
