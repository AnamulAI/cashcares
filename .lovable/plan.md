

## Plan: Brand print header + Dashboard polish + Savings ledger page

Four small, focused changes:

### 1. MahBook brand header in the print-only block
**File:** `src/components/savings/SavingsPlanDetailModal.tsx`
- Inject `<BrandLogo size="sm" />` (with text) at the top of the existing `.print-only` block, right above the plan name, separated by a thin border.
- Same pattern can later extend to PayableLedger if needed (out of scope for now).

### 2. Hide Savings tile on main dashboard
The user wants the **SAVINGS** tile (in the secondary 6-card row) removed since real savings live as plans, not raw account balances — its value of `৳0` looks misleading.

**File:** `src/components/dashboard/SecondaryCards.tsx`
- Remove the Savings `FinanceCard` and the `savings` calculation.
- Change grid from `lg:grid-cols-6` → `lg:grid-cols-5` so remaining 5 cards (Receivables, Payables, Debt/Loans, Investments, Assets) fill the row evenly.

### 3. Remove "Savings Progress" widget from dashboard
**File:** `src/pages/Dashboard.tsx`
- Drop `<SavingsProgressCard />` and its import.
- Replace the bottom row's right column (`BudgetProgress` + `SavingsProgressCard`) with just `<BudgetProgress />`.
- Leave `SavingsProgressCard.tsx` file in place (orphan, safe to keep — no router or other imports).
- Savings overdue/upcoming alerts in `AlertsCard` stay (still useful in the global Alerts widget).

### 4. Open Savings book as a full page (Payables-style), not modal

Currently `setDetailPlan(plan)` opens `SavingsPlanDetailModal`. Switch to a routed full page like `/payables/:id`.

**Changes:**
- **New file** `src/pages/SavingsLedger.tsx` — wraps existing detail layout content as a real page:
  - `useParams` to get plan id, fetch via existing `useSavingsPlans()` (find by id) or a new lightweight `useSavingsPlan(id)` selector.
  - Reuse the entire JSX body that lives inside `SavingsPlanDetailModal` (header, 6 stat cards, schedule + activity grid, filters, installments table, generate-12 footer) — but rendered as page content, not inside `<Dialog>`.
  - Includes `← Back` button to `/savings` (mirrors `PayableLedger`).
  - Same Print/CSV/Edit/Delete actions; on delete → navigate back to `/savings`.
  - Keeps `MarkInstallmentPaidModal`, `EditSavingsPlanModal`, `ConfirmDialog` mounted within the page.
- **Edit** `src/App.tsx` — add route `/savings/:id` → `<PremiumRoute><SavingsLedger /></PremiumRoute>`.
- **Edit** `src/pages/Savings.tsx`:
  - Replace `setDetailPlan(plan)` and "Open Plan" dropdown action with `navigate(\`/savings/${plan.id}\`)`.
  - Remove `SavingsPlanDetailModal` import + usage + `detailPlan` state.
- **Keep** `SavingsPlanDetailModal.tsx` file (now orphan but small risk of regressions if removed; can clean up later).

### Files touched
**New (1):** `src/pages/SavingsLedger.tsx`
**Edit (4):** `src/components/savings/SavingsPlanDetailModal.tsx` (brand header in print block — used by orphan file but harmless; SavingsLedger will reuse same print structure too), `src/components/dashboard/SecondaryCards.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Savings.tsx`, `src/App.tsx`

### Out of scope
- No DB or hook changes. No removal of `SavingsProgressCard.tsx` or `SavingsPlanDetailModal.tsx` files. No changes to translations, AlertsCard, or print stylesheet.

