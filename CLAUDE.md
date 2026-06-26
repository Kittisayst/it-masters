# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (http://localhost:5173/it-masters/)
npm run build        # tsc + vite build (output: dist/)
npm run lint         # eslint check
npm run test         # vitest run (single pass)
npm run test:watch   # vitest watch mode
npm run preview      # preview built dist locally
```

**Backend (Google Apps Script):**
```bash
cd gs_backend
clasp push           # push to Apps Script (may need --force on retry)
```

## Architecture

### Frontend: React 19 + TypeScript + Vite

**Deployment:** GitHub Pages at `https://kittisayst.github.io/it-masters/`. Vite `base: '/it-masters/'` — always reference public assets via `${import.meta.env.BASE_URL}path/to/file` (never `/path/to/file`).

**Stack:** Ant Design v6 · TanStack React Query v5 · Zustand (auth) · React Router v8 · sonner (toasts) · dayjs · recharts

**Key patterns:**
- `callApi(action, method, params)` in `src/services/api.ts` is the single API entry point — posts `Content-Type: text/plain` (no CORS preflight) to `VITE_APPS_SCRIPT_URL`
- All server state uses `useQuery` / `useMutation` / `useQueryClient`. Invalidate with `queryClient.invalidateQueries({ queryKey: ['entityName'] })` after mutations.
- Auth state: `useAuthStore` (Zustand + localStorage persist via `it-masters-auth` key)
- Mobile breakpoint: `const isMobile = !screens.md` from `Grid.useBreakpoint()`

**Layout:**
- `AppLayout.tsx` — sticky header + collapsible sidebar (desktop) / Drawer (mobile) + `<Outlet />`
- `BottomNav.tsx` — 5-slot fixed bottom navigation (mobile only). Already full — don't add more items.
- `PageHeader` component sticks below the header bar (top: 64px) and holds the page title + action buttons
- `ResponsiveTable<T>` — renders antd `Table` on desktop, Card list on mobile. Pass `mobilePrimaryFields={['field1', 'field2']}` to control which columns show on the card face; all columns appear in a detail Drawer via the eye button.

**Antd v6 deprecations to watch:**
- `Alert`: use `description` prop, not `message`. Remove `closable`/`onClose` (deprecated).
- `Statistic`: use `styles={{ content: { ... } }}` not `valueStyle`
- `Drawer`: use `styles.body`/`styles.header`/`styles.wrapper` not legacy `bodyStyle`
- `Descriptions`: use `styles={{ label: { ... } }}` not `labelStyle`

**Module structure:** each page folder has `index.tsx` (list/table + filters) and optionally `<Name>Form.tsx` (Modal form). New modules follow the Equipment pattern: `useQuery` for list, `useMutation` for CUD ops, `PageHeader` + `ResponsiveTable` + form Modal.

### Backend: Google Apps Script + SheetORM

Located in `gs_backend/`. The SheetORM library is linked in Apps Script project settings (not in this repo).

**Request routing:** `doPost(e)` in `Code.gs` parses `{ action, method, params }` and dispatches to handler functions registered in the `handlers` object.

**Adding a new module:**
1. Create `ModuleName.gs` with `handleModuleName(method, params)` function
2. Add table schema function to `schema.gs` using `getDb().table('SheetName').schema({...})`
3. Add migration to `runMigrations()` array in `schema.gs` using `SheetORM.migrate(SPREADSHEET_ID, [{ version, name, up(db), down(db) }])` — the `db` in `up(db)` is a migration-specific object with `createTable`/`dropTable`, NOT the same as `getDb()` which returns a query builder
4. Register handler in `Code.gs`: `handlers` object
5. `clasp push`
6. Create new deployment (or redeploy) in Apps Script editor to publish changes

**SPREADSHEET_ID** is set in Apps Script Project Settings > Script Properties (key: `SPREADSHEET_ID`). A fallback hardcoded ID exists in `Code.gs`.

### Environment

`.env.local` (not committed) holds:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

See `.env.example` for required variables.

## Data Model (Google Sheets)

9 sheets: `Users`, `Departments`, `Categories`, `Employees`, `WorkRecords`, `Equipment`, `BorrowingHeaders`, `BorrowingItems`, `DisbursementHeaders`, `DisbursementItems`, `ItInfo`

Borrowing and Disbursement use header+items pattern (two sheets per entity). All other entities are single-sheet.

All types are in `src/types/index.ts`. All API calls go through named api objects in `src/services/api.ts` (`equipmentApi`, `borrowingApi`, `itInfoApi`, etc.).
