
## Plan: Replace date range picker with quick-select date filter dropdown

Replace the current calendar range popover on the Transactions filter bar with a dropdown of preset date ranges (matching the uploaded design).

### Dropdown options
- **All Time** (default)
- **Today**
- **Yesterday**
- **This Week**
- **This Month**
- **Last Month**
- **This Year**
- **Last Year**
- **Custom…** → opens the existing range Calendar popover for custom from/to

### Behavior
- Selecting any preset computes `dateFrom`/`dateTo` via `date-fns` (`startOfDay`, `endOfDay`, `startOfWeek`, `startOfMonth`, `subMonths`, `startOfYear`, `subYears`) and writes them into the existing `filters.dateFrom` / `filters.dateTo` state — so all downstream filtering logic in `Transactions.tsx` stays untouched.
- Trigger button shows the selected preset label (e.g. "All Time", "This Month") with a calendar icon and chevron, matching the screenshot.
- "Custom" preset shows the formatted date range (e.g. "Nov 1 – Nov 15") on the trigger and opens the Calendar range popover.
- Active state (anything other than "All Time") tints the trigger with primary border/text — consistent with current pattern.

### Implementation
- Edit only `src/components/transactions/TransactionFilters.tsx`.
- Use shadcn `DropdownMenu` for the preset list, keep `Popover` + `Calendar` for the Custom case.
- Add a small internal `preset` state derived from `filters.dateFrom`/`dateTo` so the label stays in sync (and resets to "All Time" when Reset is clicked).
- No changes to `TransactionFilterValues` shape, no changes to `Transactions.tsx`, no DB or API changes.

### Out of scope
- Other filters (Type, Category, Account, Status) untouched.
- Search input and Reset button untouched.
