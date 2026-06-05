# Mohorana → Book-Style UI/UX (Payables/Partnerships এর মতো)

বর্তমানে Mohorana একটি 2-column card grid যেখানে detail একটি modal এ খোলে। Payables/Partnerships এর মতো "book/ledger" pattern এ নিয়ে আসব — list rows + আলাদা ledger page।

## কী পরিবর্তন হবে

### 1. `src/pages/Mohorana.tsx` — Book-style list
- **Header**: `FeatureIO` (export/import) যোগ + `Add Record` button (Payables এর মতো)
- **Stats**: ৩টি FinanceCard থেকে বাড়িয়ে ৪টি — Total Committed, Total Paid, Total Remaining, **Active Records** (Payables এর "Open Books" এর মতো)
- **Filter bar**: Search (স্ত্রীর নাম), Status select (all/active/completed/archived), Reset button
- **Bulk select**: প্রতি row এ Checkbox + `BulkActionBar` + bulk delete confirm
- **List**: 2-column grid বাদ → **single-column row cards** (Payables এর মতো):
  - বাঁয়ে: Checkbox + icon tile (HeartHandshake)
  - মাঝে: spouse_name + status badge + marriage date + "X payments · Created …"
  - ডানে (sm+): Total / Paid / Remaining (Payables এর সংখ্যা layout এর মতো)
  - শেষে: DropdownMenu — **Open Ledger**, Edit, Add Payment, Delete
- Detail modal বাদ — row click → navigate `/mohorana/:id`
- Empty state, skeleton, premium-locked block অপরিবর্তিত (style match থাকবে)

### 2. নতুন page `src/pages/MohoranaLedger.tsx` (PayableLedger এর প্যাটার্ন)
- Back button + spouse name header + status badge
- Summary cards: Total, Muajjal, Muakhkhar, Paid, Remaining, Progress %
- Muajjal/Muakhkhar breakdown card + overall Progress bar
- **Payment History table/list** (date, amount, type, account ref, note, actions)
- `Add Payment` button → existing `AddPaymentModal`
- Edit record, delete record actions (header dropdown)

### 3. Route যোগ
- `src/App.tsx` — `/mohorana/:id` → `MohoranaLedger` (PremiumRoute এ)

### 4. ছোট refactor
- `MohoranaDetailModal.tsx` — আর route থেকে ব্যবহৃত হবে না, তবে ফাইল রাখা হবে (backward-safe); future cleanup এর জন্য রেখে দেওয়া যায়। যদি চান, পুরোপুরি delete করব।
- existing hooks (`use-mohorana`, `use-mohorana-payments`) যেমন আছে তেমনই কাজ করবে — কোনো schema change নেই।

## Scope এর বাইরে
- DB schema, hooks, business logic — কিছুই বদলাবে না
- Account balance impact যোগ হবে না (আগের মতোই reference-only)
- Attachment upload UI এই পর্বে নয়

## প্রশ্ন
1. `MohoranaDetailModal.tsx` কি **delete করে দেব**, নাকি ফাইল রেখে দেব (unused)?
