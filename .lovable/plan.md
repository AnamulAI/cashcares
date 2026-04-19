

## Plan: Fix blank print on Savings Ledger page

### Root cause
The print CSS in `src/index.css` (line 315) was written when Savings opened as a Dialog modal:
```css
body > *:not([data-radix-portal]):not(script):not(style) {
  display: none !important;
}
```
This hides every direct body child except Radix portals — perfect for printing modal content rendered in a portal.

But the Savings detail view is now a **full page** (`SavingsLedger.tsx`) rendered inside the app shell (sidebar + main), not in a portal. So this rule hides the entire `#root`, leaving a blank page. That's why print preview shows nothing.

The other `.print-dialog`-scoped rules (table styling, color overrides) also won't apply to the page content since the page has no `.print-dialog` class.

### Fix — make print rules work for both modals AND full pages

**File:** `src/index.css` (print block only)

1. **Remove the body-children blanket hide.** Replace it with targeted hiding of just the app shell pieces (sidebar, header, toasts, top nav). The rest of the page content prints naturally.
2. **Generalize table & color rules** so they apply to both `.print-dialog` content and any page wrapped in a `.print-page` class (or just globally inside `@media print`).
3. **Keep `.no-print`, `.print-only`, and dialog chrome reset** intact so the existing `SavingsPlanDetailModal` (orphan but still used by other features later) and the new `SavingsLedger` page both print cleanly.

Conceptually:
```css
@media print {
  /* Hide app chrome */
  [data-sidebar], header, nav, .sidebar-trigger,
  [data-sonner-toaster], [data-radix-popper-content-wrapper] { display: none !important; }

  /* DO NOT blanket-hide body children anymore */

  /* Make main fill the page */
  main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }

  /* Tables, colors, badges — apply globally inside print, not only inside .print-dialog */
  table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; }
  th, td { border: 1px solid #d4d4d4 !important; padding: 6px 8px !important; color: black !important; }
  thead th { background: #f5f5f5 !important; font-weight: 600 !important; }

  .text-positive { color: #15803d !important; }
  .text-negative, .text-destructive { color: #b91c1c !important; }
  .text-warning { color: #b45309 !important; }
  .text-muted-foreground { color: #525252 !important; }
}
```

### Also: hide on-screen page chrome from print

**File:** `src/pages/SavingsLedger.tsx`
- The `← Back` button row already has `no-print` ✓
- The `PageHeader` actions row already has `no-print` ✓
- The 6 summary `FinanceCard`s row has `no-print` ✓ (the print-only header replaces them)
- The Schedule + Recent Activity grid has `no-print` ✓
- The filters/installments table area is currently NOT marked — need to verify it prints. Looking at the code, the filter Select and "Installments" section need: `no-print` on the filter bar, and the **Actions** column hidden in print, plus the `<PageHeader title>` should also be hidden in print (since the print-only header already shows the plan name).

Will add `no-print` to the on-screen `PageHeader` wrapper too, so only the clean print-only header + installments table show in print.

### Files touched
- `src/index.css` — rewrite the `@media print` block: remove body-children hide, generalize table/color rules
- `src/pages/SavingsLedger.tsx` — wrap on-screen `PageHeader` in `no-print`; ensure installments table Actions column gets `no-print`

### Out of scope
- No changes to `SavingsPlanDetailModal.tsx` (orphan), `PayableLedger`, `Reports.tsx`, or other print flows. Their existing `.print-dialog` / `print-section` classes continue to work because we keep those selectors and just remove the over-aggressive body hide.

