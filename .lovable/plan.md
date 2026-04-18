

## Plan: Dashboard sync + Edit Plan + CSV/Print + Dashboard savings reminders

### 1. Fix dashboard staleness on book/entry delete

**Problem:** `useDeletePayableBook` / `useDeleteReceivableBook` only invalidate `*_books`. Dashboard's `SecondaryCards` reads from `payable_entries_all` / `receivable_entries_all`, which aren't invalidated → stale totals after book deletion (DB cascades the entries but cache doesn't know).

**Fix in `src/hooks/use-payable-books.ts` & `src/hooks/use-receivable-books.ts`:**
- On delete success, also invalidate: `payable_entries`, `payable_entries_all` (and receivable equivalents), plus `accounts` (in case linked accounts had pending balances logically tied).

Entry-level deletes already invalidate the right keys — confirmed correct.

### 2. Edit Plan modal

**New file `src/components/savings/EditSavingsPlanModal.tsx`**
- Centered Dialog (max-w-lg). Mirrors `AddSavingsPlanModal` field set:
  - Plan name, Recipient, Installment amount, Frequency (weekly/monthly/quarterly), Note
- **Locked fields** (to preserve schedule integrity): Plan type, Start date, Duration, Target amount — shown read-only with helper "Cannot be changed after creation"
- Saves via existing `useUpdateSavingsPlan` (already invalidates `savings_plans`)
- Triggered from detail modal's `⋯` dropdown → new "Edit Plan" item (above Pause/Delete)

### 3. CSV + Print export for a plan's installment schedule

In `SavingsPlanDetailModal.tsx` header actions area, add a `⋯`-adjacent **Export** dropdown (or fold into existing `⋯`) with:
- **Print** → `window.print()`
- **PDF (Print)** → `window.print()`
- **CSV** → builds rows: `[#, Due Date, Amount, Paid Date, Paid Amount, Account, Status, Note]` with a header line containing plan name/recipient/frequency/target. Filename: `{plan_name}-installments-{yyyy-MM-dd}.csv`.

Pattern follows `PayableLedger.handleCSV` exactly (Blob + anchor download).

### 4. Dashboard: savings progress + next due

Two changes:

**a) New widget `SavingsProgressCard` (`src/components/dashboard/SavingsProgressCard.tsx`)**
- Lists active savings plans (top 4 by next-due) with:
  - Plan name + recipient (muted)
  - Mini progress bar (fixed plans) or "Open-ended · ৳X saved"
  - Next due date + amount
- Empty state: "No active savings plans"
- Click → navigates to `/savings`

**b) Inject upcoming installments into `AlertsCard.tsx`**
- Pull `useAllInstallments()` + `useSavingsPlans()`
- Build alert items for installments due within next 7 days or overdue:
  - Overdue → `danger` "{plan_name} installment overdue"
  - Due today/soon → `info` "{plan_name} due {date}"
- Merged with existing budget/reminder alerts; same priority sort & top-6 cap.

**Dashboard layout (`src/pages/Dashboard.tsx`)**
- Place `SavingsProgressCard` next to `BudgetProgress` in the bottom row, e.g. swap last row to: `RecentTransactions` (3 cols) | stacked `BudgetProgress` + `SavingsProgressCard` (2 cols).

### Files touched
**New (2):** `src/components/savings/EditSavingsPlanModal.tsx`, `src/components/dashboard/SavingsProgressCard.tsx`
**Edit (5):** `src/hooks/use-payable-books.ts`, `src/hooks/use-receivable-books.ts`, `src/components/savings/SavingsPlanDetailModal.tsx`, `src/components/dashboard/AlertsCard.tsx`, `src/pages/Dashboard.tsx`

### Out of scope
- No DB/schema changes. No changes to plan_type/start_date/duration logic. Reminder Center auto-creation already exists from prior turn — just surfacing them on dashboard.

