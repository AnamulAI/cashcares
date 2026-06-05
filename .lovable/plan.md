# মোহরানা (Mohorana) Module

স্ত্রীর মোহরানা/দেনমোহরের নির্ধারিত অঙ্ক ও ধাপে ধাপে পরিশোধের সম্পূর্ণ ইতিহাস রাখার জন্য একটি স্বাধীন প্রিমিয়াম মডিউল।

## Scope

- Sidebar-এ "মোহরানা" নামে নতুন পেজ (`/mohorana`)
- PremiumRoute দিয়ে গার্ড — শুধু premium ব্যবহারকারীর জন্য
- সম্পূর্ণ স্বাধীন লেজার — কোনো account balance বা transaction-এ প্রভাব পড়বে না
- বহুবিবাহ সমর্থন: একাধিক মোহরানা রেকর্ড করা যাবে (প্রতিটি স্ত্রীর জন্য আলাদা)

## Data model (2 new tables)

### `mohorana_records`
এক মোহরানার মূল তথ্য:
- `spouse_name` (স্ত্রীর নাম)
- `marriage_date` (বিবাহের তারিখ)
- `currency` (BDT/USD/…)
- `total_amount` (মোট মোহরানা)
- `muajjal_amount` (নগদ/মুয়াজ্জাল ভাগ)
- `muakhkhar_amount` (বাকি/মুআখখার ভাগ)
- `note` (বিবরণ)
- `attachment_path` (কাবিননামা ইত্যাদি — `ledger-attachments` bucket-এ)
- `status` ('active' | 'completed' | 'archived')

### `mohorana_payments`
প্রতিটি কিস্তির ইতিহাস:
- `record_id` → mohorana_records
- `paid_on` (তারিখ)
- `amount` (অঙ্ক)
- `account_id` (কোন অ্যাকাউন্ট থেকে — শুধু রেফারেন্স, balance touch হবে না, nullable)
- `payment_type` ('muajjal' | 'muakhkhar' | 'general')
- `note`
- `attachment_path` (রসিদ — optional)

দুটি টেবিলেই `user_id`, `created_at`, `updated_at` থাকবে; RLS দিয়ে শুধু owner access; `updated_at` trigger।

## UI

### Page (`src/pages/Mohorana.tsx`)
- PageHeader: "মোহরানা" + "মোট মোহরানা ও পরিশোধ ট্র্যাকিং" + "নতুন মোহরানা যোগ করুন" button
- Summary stat-row: মোট নির্ধারিত / মোট পরিশোধিত / অবশিষ্ট
- প্রতিটি record-এর জন্য কার্ড:
  - স্ত্রীর নাম, বিবাহের তারিখ, status badge
  - Progress bar: paid / total
  - মুয়াজ্জাল ও মুআখখার আলাদা breakdown
  - "বিস্তারিত" → centered Dialog
- Empty state ("এখনও কোনো মোহরানা যোগ করা হয়নি")

### Modals (centered Dialog, max-h-[90vh] overflow-y-auto)
- **AddMohoranaModal** — record তৈরি/সম্পাদনা, attachment upload
- **MohoranaDetailModal** — full info, payment history list, "পরিশোধ যোগ করুন" button, summary, attachment download
- **AddPaymentModal** — কিস্তি যোগ/সম্পাদনা (amount, date, account select, type, note, attachment)
- **ConfirmDialog** — delete confirmation (existing component reuse)

### Hooks (`src/hooks/`)
- `use-mohorana.ts` — list/create/update/delete records (React Query)
- `use-mohorana-payments.ts` — per-record payments list/create/update/delete

### Sidebar (`src/components/layout/AppSidebar.tsx`)
নতুন nav-item "মোহরানা" (icon: HeartHandshake বা Gem, feature-color: indigo→pink gradient), Premium section-এ।

### Routing (`src/App.tsx`)
`<Route path="/mohorana" element={<PremiumRoute><Mohorana /></PremiumRoute>} />`

### i18n (`src/i18n/translations.ts`)
নতুন keys: `nav.mohorana`, `mohorana.title`, `mohorana.subtitle`, `mohorana.total`, `mohorana.paid`, `mohorana.remaining`, `mohorana.muajjal`, `mohorana.muakhkhar`, `mohorana.spouseName`, `mohorana.marriageDate`, `mohorana.addRecord`, `mohorana.addPayment`, `mohorana.paymentHistory`, `mohorana.status.active|completed|archived` ইত্যাদি (en + bn)।

## Out of scope
- কোনো auto-expense বা account balance ইন্টিগ্রেশন নেই (user choice অনুযায়ী)
- Recurring reminder/notification এই plan-এ নেই (পরে যোগ করা যাবে)
- Dashboard widget এই plan-এ নেই

## Files to create
- `supabase/migrations/...` — দুটি table + RLS + GRANTs + updated_at triggers
- `src/pages/Mohorana.tsx`
- `src/components/mohorana/MohoranaCard.tsx`
- `src/components/mohorana/AddMohoranaModal.tsx`
- `src/components/mohorana/MohoranaDetailModal.tsx`
- `src/components/mohorana/AddPaymentModal.tsx`
- `src/hooks/use-mohorana.ts`
- `src/hooks/use-mohorana-payments.ts`

## Files to edit
- `src/App.tsx` — route যোগ
- `src/components/layout/AppSidebar.tsx` — nav-item
- `src/i18n/translations.ts` — labels
- `src/config/feature-colors.ts` — mohorana color token
