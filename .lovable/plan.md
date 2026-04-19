

## Goal
On the **Edit Installment** modal:
1. Add an **Account** selector (same options as MarkInstallmentPaidModal) — pre-fill with the installment's current `linked_account_id`.
2. Make **all four fields editable in every state** (paid or pending): Due Date, Amount, Account, Note. Drop the "already paid — only note editable" restriction.
3. When editing a **paid** installment: properly reconcile account balances + plan total when amount or account changes.

## Changes

### `src/components/savings/EditInstallmentModal.tsx`
- Add state `accountId` and load `useAccounts()`.
- Initialize `accountId` from `installment.linked_account_id ?? "none"` in the `useEffect`.
- Render an Account `<Select>` with "None — record only" + all accounts (mirrors MarkInstallmentPaidModal).
- Remove the `disabled={isPaid}` props on Due Date and Amount inputs.
- Remove the yellow "already paid" warning strip; replace with a subtle note for paid items: *"Editing a paid installment will adjust the linked account balance and plan total automatically."*
- On Save, build `updates` including `due_date`, `amount`, `linked_account_id` (null when "none"), `note`, **and** when paid also send `paid_amount: Number(amount)` so the hook's reconciliation path runs.

### `src/hooks/use-savings.ts` — extend `useUpdateInstallment`
Currently it only reconciles when `paid_amount` changes on the same account. Extend the paid-installment branch to handle **account changes** as well:

- If `installment.status === "paid"`:
  - Determine `oldAccount = installment.linked_account_id`, `oldAmt = installment.paid_amount`.
  - Determine `newAccount = updates.linked_account_id ?? oldAccount`, `newAmt = updates.paid_amount ?? oldAmt`.
  - If `oldAccount !== newAccount`:
    - Refund full `oldAmt` to `oldAccount` (if set).
    - Deduct full `newAmt` from `newAccount` (if set).
  - Else if `oldAmt !== newAmt`: existing single-account delta logic.
  - Update plan `total_saved` by `newAmt - oldAmt`.

This keeps all reconciliation server-side of the modal so the component stays simple.

## Out of scope
- No DB schema changes.
- Pending-installment edits already work today (no balance impact); just need the account field saved.
- The "Reverse paid installment first" button on the detail modal stays — this is an alternative power-user path; the modal now also handles edits directly.

## Files to edit
1. `src/components/savings/EditInstallmentModal.tsx`
2. `src/hooks/use-savings.ts` (`useUpdateInstallment` only)

