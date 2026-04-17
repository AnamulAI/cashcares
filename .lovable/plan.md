

## Plan: Recurring Savings (DPS / Foundation / সমিতি) module

A new **Savings** page under Wealth section in sidebar. Each savings plan tracks recurring installments toward a foundation, DPS, committee, or open-ended donation goal — with full schedule, history, optional account linking, and dual-mode maturity (fixed-term or open-ended).

### What you get

**Sidebar**
- New item: **Savings** (Wealth group, between Investments and Assets), Piggy-bank icon

**Savings page**
- Summary cards: Total Plans, Total Saved, This Month Due, Completed Plans
- Plans grid (cards): each shows name, recipient (e.g., "XYZ Foundation"), monthly amount, progress bar, next due date, status badge (Active / Completed / Paused)
- "Add Savings Plan" button

**Add/Edit Plan modal** (centered Dialog)
- Plan name, recipient/institution name, monthly amount, frequency (monthly/weekly/quarterly), start date
- Type: **Fixed-term** (set duration in months → auto-computes target & maturity date) OR **Open-ended** (no end)
- Optional notes

**Plan Detail modal** (centered Dialog, tabbed)
- **Overview tab**: progress %, total saved, remaining, next due, maturity countdown, edit/delete/pause actions
- **Schedule tab**: auto-generated installment list with due dates, each row has "Mark Paid" button, paid date, account used, status (Paid / Pending / Overdue)
- **History tab**: chronological deposit log

**Mark Installment Paid** (small Dialog)
- Date paid, amount (pre-filled, editable for partials), optional account select (`Bank — ৳5000` format), note
- If account chosen → deducts from that account balance (like an expense)
- If no account → just records the deposit, no balance impact

**Auto-reminders**
- When plan is created, generates reminder entries in Reminder Center for each upcoming due date
- Marking installment paid auto-completes that reminder

### Data model (2 new tables)

`savings_plans`: id, user_id, plan_name, recipient_name, plan_type (`fixed`|`open`), installment_amount, frequency (`monthly`|`weekly`|`quarterly`), duration_months (nullable for open), target_amount (computed for fixed), start_date, maturity_date (computed for fixed), total_saved, status (`active`|`completed`|`paused`), note, timestamps, is_demo

`savings_installments`: id, user_id, plan_id, due_date, amount, status (`pending`|`paid`|`overdue`), paid_date, paid_amount, linked_account_id (nullable), note, timestamps

Both with standard user-scoped RLS (matches your existing security architecture).

### Files to create/touch

**New**
- `supabase/migrations/<timestamp>_savings.sql` — 2 tables + RLS
- `src/hooks/use-savings.ts` — CRUD for plans + installments, auto-generate schedule, mark-paid logic with optional account deduction
- `src/pages/Savings.tsx`
- `src/components/savings/AddSavingsPlanModal.tsx`
- `src/components/savings/SavingsPlanDetailModal.tsx`
- `src/components/savings/MarkInstallmentPaidModal.tsx`
- `src/components/savings/SavingsCard.tsx`

**Edit**
- `src/App.tsx` — add `/savings` route (premium-gated like Investments)
- `src/components/layout/AppSidebar.tsx` — add Savings nav item
- `src/i18n/translations.ts` — Bangla strings (সঞ্চয়, কিস্তি, মেয়াদ, ম্যাচিউরিটি, etc.)
- `src/integrations/supabase/types.ts` — auto-regen after migration
- `src/hooks/use-reminders.ts` (or `use-savings.ts`) — bridge to create reminders for due installments

### Behavior rules
- Fixed-term plan: `target_amount = installment_amount × duration_months`, maturity auto-shown, status flips to `completed` when all installments paid
- Open-ended plan: no target, no maturity, just running total
- Marking installment paid with account → calls existing balance adjuster (same pattern as transactions)
- Overdue: any pending installment with `due_date < today` shows red badge & appears in Reminder Center
- Edit plan: allowed only if no installments paid yet (otherwise only name/note editable, to preserve history)
- Delete plan: confirms via `ConfirmDialog`, cascades installments

### UI consistency
- Uses existing `FinanceCard`, `StatCard`, `EmptyState`, `ConfirmDialog`, centered Dialog pattern (no Sheets)
- Feature color: teal/cyan (distinct from Investments purple, Assets indigo)
- Premium-gated like other Wealth modules

