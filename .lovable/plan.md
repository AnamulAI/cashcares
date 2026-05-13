# Add Sample Data to Getting Started

## Goal
Help new users understand MahBook quickly by letting them load a complete set of demo data (accounts, categories, transactions, budgets, receivables, payables, loans, assets, investments, partnerships, reminders) directly from the Getting Started card on the dashboard — without having to dig into Settings.

The full demo dataset and `loadDemoData()` / `clearDemoData()` / `isDemoDataLoaded()` helpers already exist in `src/lib/demo-data.ts`. This plan only wires them into the onboarding card and refines the UX.

## Changes

### 1. `src/components/shared/GettingStarted.tsx`
- Detect whether the workspace is empty (no accounts, categories, transactions, budgets) and whether demo data is already loaded (via `isDemoDataLoaded()`).
- Add a primary CTA row at the bottom of the card:
  - **"Load Sample Data"** button (visible when workspace is empty and demo not loaded). Calls `loadDemoData()`, shows a loading state, then a success toast and invalidates React Query caches so all dashboard widgets refresh instantly (no full page reload).
  - **"Clear Sample Data"** button (visible when demo data is detected). Confirmation via existing `ConfirmDialog`, then calls `clearDemoData()` and refreshes caches.
- Add a short helper line: "New here? Load a ready-made workspace to explore every feature."
- Keep the existing 5-step checklist and dismiss button untouched.
- After demo loads, the checklist auto-completes (steps already react to live data) so the user immediately sees a finished workspace.

### 2. `src/lib/demo-data.ts` (small cleanup)
- Remove the `localStorage.setItem("cc_notifications_v2", [...])` block from `loadDemoData()` so the previous "no fake notifications on new accounts" fix is preserved when sample data is loaded.
- Keep `localStorage.setItem("cc_plan", "yearly")` so premium-only modules become explorable.

### 3. `src/i18n/translations.ts`
- Add new keys under the `onboarding.*` namespace (English + Bangla):
  - `onboarding.tryDemo` — "Load Sample Data" / "নমুনা ডেটা লোড করুন"
  - `onboarding.clearDemo` — "Clear Sample Data" / "নমুনা ডেটা মুছুন"
  - `onboarding.demoHint` — short helper sentence
  - `onboarding.demoLoading` — "Loading sample data..."
  - `onboarding.demoLoaded` — toast success
  - `onboarding.demoCleared` — toast success

## Technical notes
- Use `useQueryClient().invalidateQueries()` on the relevant keys (`accounts`, `categories`, `transactions`, `budgets`, `receivables`, `payables`, `loans`, `assets`, `investments`, `partnerships`, `reminders`) instead of `window.location.reload()` — smoother UX.
- Keep all styling on existing semantic tokens (`bg-primary`, `text-primary-foreground`, `border-primary/20`); no hardcoded colors.
- Buttons sized `sm`, with a `Sparkles` / `Database` icon to match the card's premium look.
- Settings page demo controls remain unchanged (kept as a power-user fallback).

## Out of scope
- No DB schema changes.
- No changes to the demo dataset contents themselves.
- No changes to Settings page.
