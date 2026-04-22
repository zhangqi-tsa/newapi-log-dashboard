# AGENTS.md — newapi-log-dashboard

## Project

React 19 + TypeScript SPA dashboard for "New API" log analytics. Vite 6 build, Ant Design 6 UI, React Router 7, ECharts for charts, dayjs for dates.

## Commands

```
npm run dev       # dev server (Vite)
npm run build     # tsc → vite build (typecheck is part of build)
npm run lint      # eslint, zero-warnings enforced (--max-warnings 0)
npm run preview   # preview production build
```

No test framework configured.

## Architecture

Single-page app deployed under `/dashboard/` base path.

```
src/
  main.tsx          — entry, BrowserRouter basename="/dashboard", AntD zh_CN locale
  App.tsx           — shell layout with top nav, 3 routes
  pages/
    UserSummary/    — "/"  user-level aggregated stats + table
    ModelDimension/ — "/model" model-level aggregated stats + table
    LogDetail/      — "/log"  raw log table with filters
    Login/          — not wired into routes (unused)
  components/
    Charts/         — ECharts wrappers
    LogTable/       — raw log table
    StatsCards/     — summary stat cards
    TimeFilter/     — time range selector
    UserTable/      — aggregated user/model tables
  services/api.ts   — fetch wrapper, base `/api`, credentials: include (cookie auth)
  types/index.ts    — all TS interfaces
  utils/
    aggregator.ts   — client-side aggregation: by user, by model, stats cards
    time.ts         — time range helpers (unix timestamps), formatting
```

## Key facts

- **API proxy**: Frontend calls `/api/*`. The backend is "New API" — a separate service. Dev server has no proxy configured in `vite.config.ts`; you may need to add one for local dev.
- **Auth**: Cookie-based. `checkAuth()` hits `/api/user/self` and checks `role >= 10` (AdminUser).
- **No client state management**: No Redux/Zustand. Data flows through component-local state + direct API calls.
- **Aggregation is client-side**: `aggregateByUser()` and `aggregateByModel()` in `utils/aggregator.ts` transform raw `LogItem[]` from the API. The server `/api/log/stat` returns only `quota`, `rpm`, `tpm`.
- **Timestamps are Unix seconds** (not milliseconds). `dayjs.unix()` is used throughout.
- **Build order**: `npm run build` runs `tsc` before `vite build`. TypeScript errors will block the build.
- **Lint**: ESLint `--max-warnings 0` means any warning is a CI failure. Unused locals/params are TypeScript errors (`noUnusedLocals`, `noUnusedParameters`).
