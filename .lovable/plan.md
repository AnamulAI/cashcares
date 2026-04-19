

## Fix: Attachment constraint blocks non-ledger entry types

### Problem
The `entry_attachments.entry_type` column has a CHECK constraint that only allows `'payable'` and `'receivable'`. The app already exposes attachments on Savings Installments (and the `EntryType` type lists 6 more values), so any upload outside the original two ledgers errors with:

> new row for relation "entry_attachments" violates check constraint "entry_attachments_entry_type_check"

### Fix (single migration)
Drop the existing CHECK constraint and recreate it to match the app's `EntryType` union:

```text
payable, receivable, transaction, loan, investment,
asset, savings_installment, partnership_entry
```

Migration outline:
1. `ALTER TABLE public.entry_attachments DROP CONSTRAINT entry_attachments_entry_type_check;`
2. Re-add the CHECK with all 8 allowed values.

No code changes needed — the TypeScript `EntryType` union and `EntryAttachments` component already pass the right value (e.g. `"savings_installment"` from `EditInstallmentModal`).

### Verification
After migration, retry the failing flow: open a Savings Installment → Edit → attach a file → confirm the upload succeeds and the row appears in `entry_attachments`.

