

## Make all ledger entry rows clickable to open detail popups

### Audit
| Module | Row clickable? | Detail modal exists? |
|---|---|---|
| Transactions | Yes ✓ | Yes (`TransactionDetails`) |
| Receivable entries | No (only via "View Details" dropdown) | Yes (`ReceivableEntryDetailModal`) |
| Payable entries | No (only via dropdown) | Yes (`PayableEntryDetailModal`) |
| Partnership entries | No (only via dropdown) | Yes (inline Dialog in page) |
| Savings installments | No | **No — needs to be created** |

### Changes

**1. Make rows clickable in three existing ledgers**

In `ReceivableLedger.tsx`, `PayableLedger.tsx`, and `PartnershipLedger.tsx`, add to each `<TableRow>`:
- `onClick={() => setDetailEntry(e)}` to open the existing detail modal.
- `className` additions: `cursor-pointer hover:bg-accent/40 transition-colors` (kept compatible with the existing `pendingRowTint` class via `cn()`).
- Wrap the actions cell (the dropdown column) in `onClick={e => e.stopPropagation()}` so the menu and inner buttons don't trigger the modal — matching the proven pattern from `TransactionTable`.

**2. Create `SavingsInstallmentDetailModal` and wire it up**

New file: `src/components/savings/SavingsInstallmentDetailModal.tsx`
- Centered Dialog (`sm:max-w-md`, `max-h-[85vh] overflow-y-auto`) per project modal convention.
- Show: due date, installment #, scheduled amount, paid amount, paid date, linked account, status badge, note, and `EntryAttachments` for `entry_type="savings_installment"`.
- Read-only summary; actions (Mark Paid / Edit / Reverse / Delete) remain in the existing dropdown.

Wire-up in `SavingsLedger.tsx`:
- Add `detailInst` state.
- Make installment `<TableRow>` clickable (same pattern as above) and stop propagation on the actions cell.
- Render `<SavingsInstallmentDetailModal entry={detailInst} ... />` near the other modals.

### Out of scope
Detail popups already exist for entries on dashboard cards (Recent Transactions/Activity) and account/budget detail views; this task focuses on the ledger tables that surface raw entries.

### Verification
1. Receivable Ledger → click any row → `ReceivableEntryDetailModal` opens with collection history.
2. Payable Ledger → click any row → `PayableEntryDetailModal` opens with payment history.
3. Partnership Ledger → click any row → existing inline detail Dialog opens.
4. Savings Ledger → click any installment row → new `SavingsInstallmentDetailModal` opens with attachments.
5. Confirm clicking the row's three-dot menu (or dropdown items) does NOT also open the detail popup (event isolation works).

