# LUDI

> Let's do it — plan, train, recover.

A free, offline-first Progressive Web App for gym training. Plan your week around a split you actually like, log your sessions, warm up and cool down properly, and watch your numbers move. No games, no subscriptions, no ads, no cloud — everything lives on your device.

## Features

- **Weekly scheduler** — pick a split (Push/Pull/Legs, Upper/Lower, Arnold, Bro, Full Body) or install a classic program (StrongLifts 5×5, GZCLP, PPL, Upper/Lower, 5/3/1). LUDI assigns routines to weekdays so you always know what's next.
- **Session reminders** — a nudge on training days only, at the hour you choose. Never on a planned rest day.
- **Workout logging** — sets, reps, RPE, warmups, rest timer, plate calculator, supersets, reorder, swap, resume-after-reload.
- **Pre & post-workout stretching** — guided warm-up and cool-down routines with a follow-along timer, coaching cues and how-to videos. Your stretch time is logged automatically.
- **Exercise & stretch libraries** — ~70 exercises across every muscle group and ~30 stretches across every body area, both searchable, filterable, and extendable with your own.
- **Progressive overload** — three-lever coaching (reps → sets → weight), auto-advancing routine targets, and a deload signal.
- **Progress & insight** — weekly volume, muscle focus, training calendar, recovery body-map, per-exercise trends, estimated 1RM, personal records.
- **Health tracking** — body weight, measurements, sleep, pre-workout energy, daily steps & water, calories.
- **Personal records** — auto-detected, with a full revert when a workout is deleted.
- **Comfort & polish** — light/dark themes, kg/lbs, equipment & plate inventory (gym/home), guided tour, coach marks.
- **Your data, yours** — JSON / CSV / PDF export, import, full local reset, installable PWA.

## Tech stack

Vite · React 18 · Tailwind CSS v3 · Dexie.js (IndexedDB) · Zustand · React Router · Recharts · react-body-highlighter · lucide-react · vite-plugin-pwa · html2canvas

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
npm test         # unit tests (vitest)
```

## Deployment

Pushes to `main` build and deploy to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`).

> **Note on the base path:** the app is currently served under `/opus/` (set by `base` in `vite.config.js`). If the GitHub repository is renamed to `LUDI`, update that `base` to `/LUDI/` so Pages keeps resolving assets.

## Data & privacy

All data is stored locally in IndexedDB — nothing is sent to a server, because there is no server. Back up or move your data anytime via Settings → Data → Export / Import, or wipe it via Settings → Danger zone.

Because LUDI is fully offline with no backend, reminders fire while the app is open or installed on your phone; add it to your home screen for the most reliable nudges.

## Documentation

Plans, references, and project memory live in [`docs/`](./docs/):

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — codebase map (routes, DB, utils/hooks/stores, patterns)
- [`docs/GUIDELINES.md`](./docs/GUIDELINES.md) — engineering, UX, data-integrity & testing rules
- [`docs/RELEASES.md`](./docs/RELEASES.md) — what shipped per version
- [`docs/STATE.md`](./docs/STATE.md) — live status + build log

---

Built with Claude.
