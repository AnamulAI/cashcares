
## Plan: Rebrand "Cash Care" → "MahBook" with Portfolio Branding polish

### 1. Brand identity update

**`src/config/app.ts`**
- `name: "MahBook"`, `tagline: "Personal Finance, Refined"`

**`index.html`**
- Title, meta description, author, OG/Twitter tags → "MahBook"
- Add Google Sans family to font import (Google Fonts uses "Google Sans" via the `Product+Sans` fallback; since the real Google Sans isn't publicly served, use **Plus Jakarta Sans** — the closest open Google Sans-style geometric grotesque — labeled as `--font-display` and aliased as "Google Sans" in code intent). Keep Inter + Hind Siliguri.
- Updated import: `Plus+Jakarta+Sans:wght@500;600;700;800` + existing Inter & Hind Siliguri.

### 2. New "MB" logo component

**New** `src/components/shared/BrandLogo.tsx`
- Reusable: `<BrandLogo size="sm|md|lg" showText />`
- Rounded-rectangle (rounded-xl) with **subtle indigo→violet gradient** (`bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600`), soft inner highlight, fine ring.
- "MB" initials in white, Plus Jakarta Sans bold, slightly tightened tracking.
- Beside icon: brand name "MahBook" in `font-display` (bold 700), with a subtle indigo gradient text fill on hover.
- Used in: `AppSidebar` header, `Auth` page header, future loading screens.

### 3. Sidebar polish (Portfolio Branding vibe)

**`src/components/layout/AppSidebar.tsx`**
- Replace "CC" block with `<BrandLogo />`.
- Smooth hover on items: add `hover:translate-x-0.5 hover:shadow-sm` micro-interaction, `transition-all duration-200 ease-out`.
- Active item: gradient pill background `bg-gradient-to-r from-primary/10 to-violet-500/5` + left accent bar.
- Group labels: tighter tracking, slight uppercase contrast bump.

### 4. Typography pass

**`src/index.css`**
- Body font stack: keep Inter + Hind Siliguri (Bangla preserved).
- `--font-display` → Plus Jakarta Sans for headings, labels, brand.
- Tailwind config: add `display: ['"Plus Jakarta Sans"', "Inter", ...]` so `font-display` resolves correctly across the app (already used in Auth/Sidebar).
- Add comment block confirming Bangla fallback chain unchanged.

**`tailwind.config.ts`** — extend `fontFamily.display`.

### 5. Dashboard cohesion (no layout change)

**`src/index.css`**
- Refine `--shadow-card` and `--shadow-card-hover` to be slightly deeper but still soft (Portfolio feel).
- Add new utility class `.finance-card-hover` with smooth `hover:-translate-y-0.5` lift + shadow upgrade.
- Tweak feature color tokens for **subtle indigo/violet harmony**: shift `--feature-budget`, `--feature-transactions`, `--feature-reports` a few degrees toward indigo so dashboard cards read as one family. Income/Expense semantics preserved.

**Dashboard widgets** (`SummaryCards`, `SecondaryCards`, `TrendChart`, `DistributionChart`, `AlertsCard`, `BudgetProgress`, `RecentTransactions`, `QuickActions`)
- Apply `finance-card-hover` class.
- Standardize internal padding to `p-5` and gap rhythm to `gap-4`.
- Net Worth hero card: subtle indigo-violet gradient overlay on top border.

### 6. Other "Cash Care" references

- `src/pages/Auth.tsx` → BrandLogo + "MahBook" + tagline.
- `src/pages/Reports.tsx` print header → "MahBook — Financial Report".

### 7. Memory updates

- Update `mem://project/config` and Core in `mem://index.md`: app name is now MahBook (BDT preserved), display font Plus Jakarta Sans.
- Add `mem://design/visual-identity/brand` describing MahBook logo (MB monogram, indigo→violet gradient, rounded-xl).

### Out of scope
- No DB changes. No route changes. No new features. Dashboard structure untouched — only color/shadow/spacing refinement.

### Files touched
**New (1):** `src/components/shared/BrandLogo.tsx`
**Edit (~12):** `src/config/app.ts`, `index.html`, `tailwind.config.ts`, `src/index.css`, `src/components/layout/AppSidebar.tsx`, `src/pages/Auth.tsx`, `src/pages/Reports.tsx`, 6 dashboard widget files, memory files.
