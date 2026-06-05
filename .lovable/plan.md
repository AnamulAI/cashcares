
# মোহরানা — কর্জ/সমন্বয় (Adjustments) ফিচার

স্বামী যদি স্ত্রীর কাছ থেকে কর্জ নেন (যেমন স্বর্ণ বিক্রি করে ঋণ শোধ বা বিপদে ব্যবহার), সেটি মোহরানার বকেয়ার সাথে যোগ হবে। তাই Remaining = (মোট মোহরানা + সব Adjustments) − মোট পরিশোধ।

## ১) ডেটাবেস

নতুন টেবিল **`mohorana_adjustments`** (Mohorana payments টেবিলের অনুরূপ গঠন):

- `record_id` — কোন মোহরানা রেকর্ডের সাথে যুক্ত
- `adjusted_on` — তারিখ
- `amount` — কর্জ/সমন্বয়ের অঙ্ক (BDT)
- `reason` — কারণ (যেমন "স্বর্ণ বিক্রি", "জরুরি কর্জ" ইত্যাদি — ছোট ড্রপডাউন/টেক্সট)
- `note` — বিস্তারিত নোট
- `attachment_path` — ভবিষ্যৎ সংযুক্তির জন্য

RLS: শুধুমাত্র মালিক (user_id) দেখতে/সম্পাদনা করতে পারবেন। Service role-এ ALL access।

## ২) Hook

`src/hooks/use-mohorana-adjustments.ts` — Payments hook-এর প্যাটার্নে CRUD (list / create / update / delete)।

## ৩) UI পরিবর্তন (MohoranaLedger)

- নতুন **Add Adjustment Modal** (`AddAdjustmentModal.tsx`) — তারিখ, অঙ্ক, কারণ, নোট।
- হেডারে নতুন বাটন: **"কর্জ যোগ করুন"** (Add Adjustment) — addPayment-এর পাশে।
- Summary recalculation:
  - **মোট দায়** = `total_amount + sum(adjustments)`
  - **পরিশোধ** = আগের মতো
  - **বাকি** = মোট দায় − পরিশোধ
  - নতুন কার্ড: **"কর্জ/সমন্বয়"** (Adjustments মোট)
- Muajjal/Muakhkhar ব্রেকডাউনের নিচে নতুন সেকশন: **"কর্জ/সমন্বয় ইতিহাস"** — টেবিল (তারিখ, কারণ, নোট, অঙ্ক, Edit/Delete)।
- CSV এক্সপোর্ট ও Print statement-এ Adjustments সারি যোগ হবে।

## ৪) Mohorana list page

প্রতিটি record-এর Remaining হিসাব এখন adjustments যোগ করে দেখাবে।

## ৫) ব্যালেন্স প্রভাব

আগের নিয়মের মতো — Adjustment বা Payment কোনোটাই অ্যাকাউন্ট ব্যালেন্সে effect করবে না (reference-only ledger)।

## i18n

নতুন কী: `mohorana.adjustment`, `mohorana.addAdjustment`, `mohorana.adjustmentHistory`, `mohorana.adjustmentReason`, `mohorana.totalLiability`, ইত্যাদি — বাংলা + ইংরেজি।

---

আপনি অনুমোদন দিলে আমি এই পরিবর্তনগুলো একসাথে বাস্তবায়ন করব (migration → hook → modal → ledger UI আপডেট)।
