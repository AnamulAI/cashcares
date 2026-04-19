

## Problem
Across modules other than Transactions, only the **collection / payment / repayment** action adjusts account balances. Plain **add / edit / delete** of an entry that is linked to an account does not. So:

- Add a Receivable entry with `collected_amount = 1000` and a linked account → account balance unchanged.
- Edit an entry's amount, account, or paid amount → no balance reconciliation.
- Delete an entry that had been collected/paid against an account → balance keeps the inflow/outflow but the source row is gone.
- Same gap in Payable entries, Loans, Savings installments (edit/delete after paid), Assets, Investments.
- Partnerships also accept `linked_account_id` on entries but never touch the account.

Only `useTransactions` (`src/hooks/use-transactions.ts`) does proper reverse-then-reapply on create/update/delete.

## Fix Strategy
Apply the **same reverse-then-reapply pattern** used in `use-transactions.ts` to every other write hook that owns a `linked_account_id` field. Each module has a clear "cash impact" definition:

| Module | Cash impact on linked account |
|---|---|
| Receivable entry | `+collected_amount` (money came in) |
| Payable entry | `-paid_amount` (money went out) |
| Loan | create with linked account = `+principal_amount` (borrowed cash in); paid_amount changes already handled in repayment |
| Savings installment | already handled in mark-paid; needs reversal on **edit-after-paid** and **delete-after-paid** |
| Asset | `-purchase_value` on create (cash out for asset); reverse on delete; reconcile on edit when account or value changes |
| Investment | `-invested_amount` on create; reverse on delete; reconcile on edit |
| Partnership entry | follow accounting rules per `entry_type` (initial/new_invest = `-amount` from contributor's account; withdraw = `+amount`; profit_distribution / reinvest = no account move unless `linked_account_id` set, then `-amount`) |
| Receivable / Payable book (parent) | no change — these are aggregate containers, balance moves happen at entry level |

All hooks will:
1. Fetch current row before update/delete.
2. Reverse old impact on old `linked_account_id`.
3. For updates, apply new impact on new `linked_account_id`.
4. Invalidate `["accounts"]` query so all UIs re-render.

## Files to change
- `src/hooks/use-receivable-entries.ts` — add reverse/reapply in create/update/delete based on `collected_amount`; invalidate accounts.
- `src/hooks/use-payable-entries.ts` — same, based on `paid_amount`.
- `src/hooks/use-loans.ts` — apply principal on create, reverse on delete, reconcile on update if account or principal changes.
- `src/hooks/use-savings.ts` — handle reversal in a new `useReverseInstallment` (already partly present in `SavingsPlanDetailModal.tsx`, will be promoted to the hook) and reconcile on `EditInstallmentModal` if amount changes after paid.
- `src/hooks/use-assets.ts` — apply on create/delete/update (account or purchase_value change).
- `src/hooks/use-investments.ts` — same as assets.
- `src/hooks/use-partnerships.ts` — extend `useCreatePartnershipEntry / useUpdatePartnershipEntry / useDeletePartnershipEntry` to move balance per entry_type rules.
- Add a small shared helper `src/hooks/_account-balance.ts` with `adjustBalance(accountId, delta)` to avoid the repeated copy that exists in 5 files today.
- `src/components/savings/SavingsPlanDetailModal.tsx` — replace its inline reversal block with the new hook so logic lives in one place.

## Out of scope
- No DB migration. All adjustments stay client-side (matches existing pattern in `use-transactions.ts`).
- No retroactive correction of historical balances. Only future writes will be reconciled. (Optional follow-up: a one-shot "Recompute account balances" admin tool — happy to plan separately.)
- No changes to Categories, Budgets, Reminders (no money flow into accounts).

## Risk notes
- Multiple sequential balance writes are not atomic — same as today's Transactions hook. Acceptable given the app's pattern; an RPC could harden this later.
- For partnerships, only entries with a `linked_account_id` will move money — existing entries without one stay unaffected, so no breakage of current data.

