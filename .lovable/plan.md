

## Plan: Savings — Payables-style list + Partnerships-style detail view

দুই layer-এ Savings পেজকে redesign করা হবে:

### 1. Outer list (Savings.tsx) — Payables-style book rows
- ৩-কলাম card grid বাদ → full-width row list
- প্রতি row: Checkbox · `PiggyBank` icon tile (`bg-feature-savings/10 rounded-xl`) · Plan name + status badge · recipient/meta line · right-side mini totals (Capital/Saved/Remaining) · ⋯ menu
- উপরে existing 4 StatCards অপরিবর্তিত
- Search + Status filter (All/Active/Paused/Completed) + Sort (Latest) — Partnerships-এর pattern অনুসরণ
- BulkActionBar (Delete) যোগ
- Row click → `SavingsPlanDetailModal` খুলবে (এখন full-screen Dialog হিসেবে — নিচে দেখুন)

### 2. Detail view (SavingsPlanDetailModal) — Partnerships-style premium layout

বর্তমানে modal-টা compact। সেটাকে Partnerships detail-এর মতো একটা **wide, full-page-style Dialog** এ রূপান্তর করা হবে (max-w-6xl, max-h-[92vh], overflow-y-auto)।

**Header**:
- Plan name (text-2xl bold) + status badge inline
- Subtitle: `Recipient · Frequency · Type · Note` muted line
- Right side: `+ Add Installment` (gradient primary button, যদি open-ended বা extendable) + `⋯` menu (Edit/Delete/Export)

**Stats row (6 cards, Partnerships-এর মতো)**:
1. Total Target (or "Open-ended")
2. Total Saved
3. Remaining
4. Paid Installments (count)
5. Pending Installments
6. Next Due Date

প্রতিটা card: small icon tile + uppercase muted label + bold value (Partnerships ss-এর exact style)।

**Progress section** (নতুন, Partnerships-এর partner cards-এর জায়গায়):
- দুটো side-by-side card:
  - **Schedule Overview**: Total installments, Paid, Pending, Overdue counts; thin progress bar
  - **Recent Activity**: শেষ ৩-৪ paid installments summary

**Filters bar**:
- Status filter (All / Pending / Paid / Overdue)
- Date range filter (optional) — Partnerships-এর "All Types/All Partners" dropdown style

**Installments table** (Partnerships entries table-এর exact structure):
| Date | Installment # | Amount | Paid Amount | Account | Status | Actions |

- Status badge: Paid (green soft) / Pending (muted) / Overdue (red soft)
- Actions ⋯: Mark Paid / Edit / Delete / Reverse (যদি paid)
- Empty state row যদি কোনো installment না থাকে
- Open-ended plan হলে নিচে "Generate next 12 installments" button (existing functionality preserve)

### Files to edit
- `src/pages/Savings.tsx` — list redesign + filters + bulk actions
- `src/components/savings/SavingsPlanDetailModal.tsx` — full Partnerships-style detail layout

### Untouched
- `AddSavingsPlanModal`, `MarkInstallmentPaidModal`, all hooks, DB schema
- `SavingsCard.tsx` থাকবে (orphan হলেও safe)
- 4 outer StatCards untouched
- Reminder/NetWorth integration untouched

### Out of scope
- নতুন route বা schema change নেই
- Partnership-specific 2-partner concept Savings-এ আসবে না

