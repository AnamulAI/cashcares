

## Plan: 12 Cash Care fixes & enhancements

I've reviewed the codebase. Here's what I'll do, grouped into 4 batches.

### A. Bug fixes
1. **Transactions edit → category count not live updating** — `useUpdateTransaction` doesn't invalidate the `categories` query. Fix: invalidate `categories` cache after create/update/delete.
2. **Payable/Receivable add entry → account select doesn't show amount** — Account dropdown shows only name. Fix: show `Account name — ৳balance` in `PayableLedger` & `ReceivableLedger` entry modals (and Record Payment/Collection modals).
3. **Reports → chart shows only on Overview tab** — Add a relevant chart at the top of each tab (Income, Expense, Budget, Savings, Receivables, Payables, Debt, Assets, Investments) above the existing summary list.
4. **Split Payment not working** — In `AddExpenseModal`, the split rows are unwired (no state, not saved). Fix: wire splits to state, validate sum equals total, save as multiple linked expense transactions sharing a tag.
5. **Transactions: no date search** — Add a from/to date picker (popover with calendar) to `TransactionFilters` and apply in filtering logic.
6. **Transactions: when category selected, show that category's totals** — Add a small summary strip above the transactions table showing filtered Total Income / Total Expense / Net for the active filters.

### B. Bangla wording rename
7. Person-context only: replace **পাওনা → পাওনাদার** and **দেনা → দেনাদার** in subtitles, ledger headers, person-list section labels. Keep noun money usage (`receivables.title = পাওনা`, `dashboard.payables = দেনা`) intact since those mean the money, not the person.

### C. New icons (extend `category-icons.ts`)
8. **Shopping**: ShoppingBag, Store, Tag, Percent, BadgePercent
9. **Helping hand**: HandHeart, HelpingHand, Sprout, UsersRound
10. **Medicine**: Pill, Stethoscope, Syringe, Cross, Bandage, Activity
11. **Travel**: MapPin, Map, Luggage, Tent, Mountain, Ship, TrainFront, Bike
12. **Fast Food**: Pizza, Sandwich, Beef, IceCream, Cookie, Soup

### D. Import file upload for Payables / Receivables
13. New `ImportLedgerModal.tsx` (CSV) accessible from Payables and Receivables main page header. Columns: `Person Name, Phone, Description, Amount, Due Date`. Bulk-creates books + opening entries. Same UX pattern as existing `ImportDataModal`.

---

### Files to touch
- `src/hooks/use-transactions.ts` — invalidate categories
- `src/components/transactions/TransactionFilters.tsx` — date range
- `src/pages/Transactions.tsx` — date-range filter + category totals strip
- `src/components/transactions/AddExpenseModal.tsx` — wire split payments
- `src/pages/PayableLedger.tsx`, `src/pages/ReceivableLedger.tsx` — account dropdown w/ balance
- `src/pages/Reports.tsx` — per-tab charts
- `src/components/categories/category-icons.ts` — new icons
- `src/i18n/translations.ts` — পাওনাদার/দেনাদার rewording
- `src/pages/Payables.tsx`, `src/pages/Receivables.tsx` + new `src/components/shared/ImportLedgerModal.tsx`

No DB migration needed.

### 3 quick clarifications

**Q1 — Split Payment storage:**
A) Save as multiple separate expense transactions sharing a tag (recommended — each shows in account properly)
B) Save as one transaction with split details inside note text

**Q2 — Reports per-tab chart style:**
A) Auto-pick (Pie for breakdowns, Bar for budget, Line for trend) — recommended
B) Bar chart everywhere for consistency

**Q3 — Import file format:**
A) CSV only (lighter, simpler) — recommended
B) CSV + Excel (.xlsx)

Reply with `1A 2A 3A` (or your choices) and I'll implement everything.

