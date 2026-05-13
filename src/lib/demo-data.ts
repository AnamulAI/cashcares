import { supabase } from "@/integrations/supabase/client";

// Fixed UUIDs so we can reference them across tables and avoid duplicates
const ACCOUNT_IDS = {
  cash: "d0000001-0001-4000-8000-000000000001",
  brac: "d0000001-0001-4000-8000-000000000002",
  bkash: "d0000001-0001-4000-8000-000000000003",
  nagad: "d0000001-0001-4000-8000-000000000004",
  business: "d0000001-0001-4000-8000-000000000005",
};

const CAT_IDS = {
  salary: "d0000002-0001-4000-8000-000000000001",
  freelance: "d0000002-0001-4000-8000-000000000002",
  businessIncome: "d0000002-0001-4000-8000-000000000003",
  food: "d0000002-0001-4000-8000-000000000004",
  transport: "d0000002-0001-4000-8000-000000000005",
  bills: "d0000002-0001-4000-8000-000000000006",
  shopping: "d0000002-0001-4000-8000-000000000007",
  education: "d0000002-0001-4000-8000-000000000008",
  health: "d0000002-0001-4000-8000-000000000009",
  family: "d0000002-0001-4000-8000-000000000010",
  training: "d0000002-0001-4000-8000-000000000011",
  entertainment: "d0000002-0001-4000-8000-000000000012",
  household: "d0000002-0001-4000-8000-000000000013",
  emergencyFund: "d0000002-0001-4000-8000-000000000014",
  goalSaving: "d0000002-0001-4000-8000-000000000015",
  rental: "d0000002-0001-4000-8000-000000000016",
};

const accounts = [
  { id: ACCOUNT_IDS.cash, name: "Cash Wallet", type: "cash", balance: 14200, currency: "BDT", color: "#10b981", icon: "Wallet", is_primary: true, is_active: true, is_demo: true },
  { id: ACCOUNT_IDS.brac, name: "BRAC Bank", type: "bank", balance: 195000, currency: "BDT", color: "#6366f1", icon: "Building2", is_primary: false, is_active: true, is_demo: true },
  { id: ACCOUNT_IDS.bkash, name: "bKash Personal", type: "mobile_wallet", balance: 9500, currency: "BDT", color: "#e11d48", icon: "Smartphone", is_primary: false, is_active: true, is_demo: true },
  { id: ACCOUNT_IDS.nagad, name: "Nagad", type: "mobile_wallet", balance: 4200, currency: "BDT", color: "#f97316", icon: "Smartphone", is_primary: false, is_active: true, is_demo: true },
  { id: ACCOUNT_IDS.business, name: "Business Account", type: "business", balance: 520000, currency: "BDT", color: "#8b5cf6", icon: "Briefcase", is_primary: false, is_active: true, is_demo: true },
];

const categories = [
  { id: CAT_IDS.salary, name: "Salary", group: "income", icon: "Banknote", color: "#10b981", usage_count: 12, usable_in_budgets: false, is_demo: true },
  { id: CAT_IDS.freelance, name: "Freelance", group: "income", icon: "Laptop", color: "#06b6d4", usage_count: 8, usable_in_budgets: false, is_demo: true },
  { id: CAT_IDS.businessIncome, name: "Business Revenue", group: "income", icon: "TrendingUp", color: "#8b5cf6", usage_count: 5, usable_in_budgets: false, is_demo: true },
  { id: CAT_IDS.rental, name: "Rental Income", group: "income", icon: "Home", color: "#f59e0b", usage_count: 3, usable_in_budgets: false, is_demo: true },
  { id: CAT_IDS.food, name: "Food & Dining", group: "expense", icon: "UtensilsCrossed", color: "#f97316", usage_count: 42, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.transport, name: "Transport", group: "expense", icon: "Car", color: "#6366f1", usage_count: 20, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.bills, name: "Bills & Utilities", group: "expense", icon: "Zap", color: "#eab308", usage_count: 11, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.shopping, name: "Shopping", group: "expense", icon: "ShoppingBag", color: "#ec4899", usage_count: 14, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.education, name: "Education", group: "expense", icon: "GraduationCap", color: "#3b82f6", usage_count: 6, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.health, name: "Health & Medical", group: "expense", icon: "Heart", color: "#ef4444", usage_count: 4, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.family, name: "Family", group: "expense", icon: "Heart", color: "#e11d48", usage_count: 7, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.training, name: "Training", group: "expense", icon: "BookOpen", color: "#14b8a6", usage_count: 3, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.entertainment, name: "Entertainment", group: "expense", icon: "Gamepad2", color: "#a855f7", usage_count: 9, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.household, name: "Household", group: "expense", icon: "Home", color: "#78716c", usage_count: 16, usable_in_budgets: true, is_demo: true },
  { id: CAT_IDS.emergencyFund, name: "Emergency Fund", group: "savings", icon: "Shield", color: "#10b981", usage_count: 4, usable_in_budgets: false, is_demo: true },
  { id: CAT_IDS.goalSaving, name: "Goal Saving", group: "savings", icon: "Target", color: "#06b6d4", usage_count: 2, usable_in_budgets: false, is_demo: true },
];

const transactions = [
  { id: "d0000003-0001-4000-8000-000000000001", type: "income", category_id: CAT_IDS.salary, account_id: ACCOUNT_IDS.brac, amount: 80000, date: "2026-03-01", note: "March salary — full time", status: "completed", tags: ["salary","march"], is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000002", type: "income", category_id: CAT_IDS.freelance, account_id: ACCOUNT_IDS.bkash, amount: 28000, date: "2026-03-03", note: "Client website project", status: "completed", tags: ["freelance","web"], is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000003", type: "income", category_id: CAT_IDS.businessIncome, account_id: ACCOUNT_IDS.business, amount: 135000, date: "2026-03-01", note: "Monthly business revenue", status: "completed", tags: ["business"], is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000004", type: "income", category_id: CAT_IDS.rental, account_id: ACCOUNT_IDS.brac, amount: 16000, date: "2026-03-01", note: "Flat rent received", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000005", type: "expense", category_id: CAT_IDS.food, account_id: ACCOUNT_IDS.cash, amount: 920, date: "2026-03-06", note: "Lunch at office canteen", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000006", type: "expense", category_id: CAT_IDS.food, account_id: ACCOUNT_IDS.cash, amount: 1350, date: "2026-03-05", note: "Dinner with family", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000007", type: "expense", category_id: CAT_IDS.transport, account_id: ACCOUNT_IDS.bkash, amount: 380, date: "2026-03-06", note: "Uber ride to office", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000008", type: "expense", category_id: CAT_IDS.transport, account_id: ACCOUNT_IDS.cash, amount: 1600, date: "2026-03-03", note: "CNG auto fare — weekly", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000009", type: "expense", category_id: CAT_IDS.bills, account_id: ACCOUNT_IDS.brac, amount: 4800, date: "2026-03-02", note: "Internet bill — March", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000010", type: "expense", category_id: CAT_IDS.bills, account_id: ACCOUNT_IDS.brac, amount: 3900, date: "2026-03-01", note: "Electricity bill", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000011", type: "expense", category_id: CAT_IDS.shopping, account_id: ACCOUNT_IDS.brac, amount: 8200, date: "2026-03-02", note: "New clothing — Eid prep", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000012", type: "expense", category_id: CAT_IDS.shopping, account_id: ACCOUNT_IDS.cash, amount: 3400, date: "2026-03-05", note: "Wireless headphones", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000013", type: "expense", category_id: CAT_IDS.education, account_id: ACCOUNT_IDS.brac, amount: 15000, date: "2026-03-01", note: "Online course subscription", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000014", type: "expense", category_id: CAT_IDS.health, account_id: ACCOUNT_IDS.brac, amount: 2800, date: "2026-03-02", note: "Doctor visit + medicine", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000015", type: "expense", category_id: CAT_IDS.training, account_id: ACCOUNT_IDS.bkash, amount: 8500, date: "2026-03-03", note: "Workshop registration fee", status: "pending", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000016", type: "expense", category_id: CAT_IDS.entertainment, account_id: ACCOUNT_IDS.nagad, amount: 600, date: "2026-03-04", note: "Movie ticket — Star Cineplex", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000017", type: "expense", category_id: CAT_IDS.household, account_id: ACCOUNT_IDS.cash, amount: 5800, date: "2026-03-04", note: "Weekly groceries", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000018", type: "expense", category_id: CAT_IDS.family, account_id: ACCOUNT_IDS.bkash, amount: 5000, date: "2026-03-02", note: "Family support — monthly", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000019", type: "transfer", category_id: null, account_id: ACCOUNT_IDS.brac, to_account_id: ACCOUNT_IDS.cash, amount: 10000, date: "2026-03-04", note: "ATM withdrawal", status: "completed", is_demo: true },
  { id: "d0000003-0001-4000-8000-000000000020", type: "transfer", category_id: null, account_id: ACCOUNT_IDS.cash, to_account_id: ACCOUNT_IDS.bkash, amount: 5000, date: "2026-03-05", note: "bKash top up", status: "completed", is_demo: true },
];

const budgets = [
  { id: "d0000004-0001-4000-8000-000000000001", category_id: CAT_IDS.food, allocated_amount: 15000, period_type: "monthly", start_date: "2026-03-01", alert_threshold: 75, is_demo: true },
  { id: "d0000004-0001-4000-8000-000000000002", category_id: CAT_IDS.transport, allocated_amount: 8000, period_type: "monthly", start_date: "2026-03-01", alert_threshold: 80, is_demo: true },
  { id: "d0000004-0001-4000-8000-000000000003", category_id: CAT_IDS.bills, allocated_amount: 12000, period_type: "monthly", start_date: "2026-03-01", alert_threshold: 80, is_demo: true },
  { id: "d0000004-0001-4000-8000-000000000004", category_id: CAT_IDS.shopping, allocated_amount: 10000, period_type: "monthly", start_date: "2026-03-01", alert_threshold: 80, is_demo: true },
  { id: "d0000004-0001-4000-8000-000000000005", category_id: CAT_IDS.family, allocated_amount: 6000, period_type: "monthly", start_date: "2026-03-01", alert_threshold: 85, is_demo: true },
];

const receivables = [
  { id: "d0000005-0001-4000-8000-000000000001", person_name: "Rahim Uddin", total_amount: 12000, received_amount: 0, status: "open", due_date: "2026-03-15", reason: "Laptop repair cost shared", linked_account_id: ACCOUNT_IDS.bkash, is_demo: true },
  { id: "d0000005-0001-4000-8000-000000000002", person_name: "Kamal Hasan", total_amount: 8000, received_amount: 3000, status: "partial", due_date: "2026-03-10", reason: "Trip expense split", is_demo: true },
  { id: "d0000005-0001-4000-8000-000000000003", person_name: "Nusrat Jahan", total_amount: 5000, received_amount: 5000, status: "collected", due_date: "2026-02-28", reason: "Book purchase reimbursement", is_demo: true },
  { id: "d0000005-0001-4000-8000-000000000004", person_name: "Tanvir Ahmed", total_amount: 15000, received_amount: 0, status: "overdue", due_date: "2026-02-20", reason: "Freelance sub-contract payment", is_demo: true },
];

const payables = [
  { id: "d0000006-0001-4000-8000-000000000001", person_name: "Shopno Electronics", total_amount: 22000, paid_amount: 0, status: "open", due_date: "2026-03-20", reason: "AC installment", is_demo: true },
  { id: "d0000006-0001-4000-8000-000000000002", person_name: "Arif Khan", total_amount: 10000, paid_amount: 4000, status: "partial", due_date: "2026-03-12", reason: "Borrowed for emergency", is_demo: true },
  { id: "d0000006-0001-4000-8000-000000000003", person_name: "Rimi Akter", total_amount: 3000, paid_amount: 3000, status: "paid", due_date: "2026-02-25", reason: "Shared dinner expense", is_demo: true },
  { id: "d0000006-0001-4000-8000-000000000004", person_name: "Masud Rana", total_amount: 7000, paid_amount: 0, status: "overdue", due_date: "2026-02-15", reason: "Training material cost", is_demo: true },
];

const loans = [
  { id: "d0000007-0001-4000-8000-000000000001", lender_name: "BRAC Bank", loan_type: "borrowed", principal_amount: 200000, paid_amount: 48000, status: "active", due_date: "2027-03-01", installment_amount: 8500, interest_rate: 9, linked_account_id: ACCOUNT_IDS.brac, note: "Personal loan — 2 year term", is_demo: true },
  { id: "d0000007-0001-4000-8000-000000000002", lender_name: "Jamal Uddin", loan_type: "lent", principal_amount: 30000, paid_amount: 10000, status: "active", due_date: "2026-06-01", note: "Lent to friend for business", is_demo: true },
  { id: "d0000007-0001-4000-8000-000000000003", lender_name: "City Bank", loan_type: "borrowed", principal_amount: 50000, paid_amount: 50000, status: "paid", due_date: "2026-01-15", note: "Short term loan — fully repaid", is_demo: true },
  { id: "d0000007-0001-4000-8000-000000000004", lender_name: "Sharif Miah", loan_type: "lent", principal_amount: 20000, paid_amount: 0, status: "overdue", due_date: "2026-02-01", note: "Personal loan to relative — overdue", is_demo: true },
];

const assets = [
  { id: "d0000008-0001-4000-8000-000000000001", asset_name: "Gold Savings (5 vori)", asset_type: "gold", purchase_value: 520000, current_value: 580000, status: "active", acquisition_date: "2024-06-15", is_demo: true },
  { id: "d0000008-0001-4000-8000-000000000002", asset_name: "MacBook Pro M3", asset_type: "electronics", purchase_value: 180000, current_value: 140000, status: "active", acquisition_date: "2025-01-10", note: "Primary work laptop", is_demo: true },
  { id: "d0000008-0001-4000-8000-000000000003", asset_name: "Land Share — Keraniganj", asset_type: "property", purchase_value: 800000, current_value: 950000, status: "active", acquisition_date: "2023-03-20", is_demo: true },
  { id: "d0000008-0001-4000-8000-000000000004", asset_name: "Office Furniture Set", asset_type: "other", purchase_value: 65000, current_value: 45000, status: "active", acquisition_date: "2024-11-01", is_demo: true },
];

const investments = [
  { id: "d0000009-0001-4000-8000-000000000001", investment_name: "Monthly DPS — BRAC", investment_type: "dps", invested_amount: 120000, current_value: 128000, status: "active", start_date: "2025-01-01", linked_account_id: ACCOUNT_IDS.brac, note: "৳10,000/month DPS", is_demo: true },
  { id: "d0000009-0001-4000-8000-000000000002", investment_name: "Stock — Grameenphone", investment_type: "stock", invested_amount: 85000, current_value: 92000, status: "active", start_date: "2025-06-15", note: "DSE listed stock", is_demo: true },
  { id: "d0000009-0001-4000-8000-000000000003", investment_name: "Crypto — BTC holding", investment_type: "crypto", invested_amount: 50000, current_value: 62000, status: "active", start_date: "2025-09-01", note: "Small BTC allocation", is_demo: true },
  { id: "d0000009-0001-4000-8000-000000000004", investment_name: "Business — Tea Stall Partnership", investment_type: "business", invested_amount: 100000, current_value: 115000, status: "active", start_date: "2024-12-01", note: "50% share in local tea stall", is_demo: true },
];

const partnerships = [
  { id: "d000000a-0001-4000-8000-000000000001", partnership_name: "Tea Stall — Gulshan", partner_name: "Sumon Ali", your_contribution: 100000, partner_contribution: 100000, shared_expense_total: 35000, settlement_amount: 12000, status: "active", start_date: "2024-12-01", note: "50-50 profit sharing", is_demo: true },
  { id: "d000000a-0001-4000-8000-000000000002", partnership_name: "Freelance Project Pool", partner_name: "Rafiq Ahmed", your_contribution: 50000, partner_contribution: 30000, shared_expense_total: 15000, settlement_amount: 5000, status: "active", start_date: "2025-08-01", note: "Revenue split based on contribution ratio", is_demo: true },
];

const partnershipEntries = [
  { id: "d000000b-0001-4000-8000-000000000001", partnership_id: "d000000a-0001-4000-8000-000000000001", entry_type: "contribution", amount: 100000, contributor: "You", date: "2024-12-01", description: "Initial investment", is_demo: true },
  { id: "d000000b-0001-4000-8000-000000000002", partnership_id: "d000000a-0001-4000-8000-000000000001", entry_type: "contribution", amount: 100000, contributor: "Sumon Ali", date: "2024-12-01", description: "Partner initial investment", is_demo: true },
  { id: "d000000b-0001-4000-8000-000000000003", partnership_id: "d000000a-0001-4000-8000-000000000001", entry_type: "expense", amount: 35000, date: "2026-02-15", description: "Renovation + supplies", is_demo: true },
  { id: "d000000b-0001-4000-8000-000000000004", partnership_id: "d000000a-0001-4000-8000-000000000002", entry_type: "contribution", amount: 50000, contributor: "You", date: "2025-08-01", description: "Project fund", is_demo: true },
];

const reminders = [
  { id: "d000000c-0001-4000-8000-000000000001", title: "Budget alert — Shopping over limit", reminder_type: "budget", priority: "high", status: "upcoming", due_date: "2026-03-06", related_module: "budgets", note: "Shopping budget exceeded ৳10,000 limit", is_demo: true },
  { id: "d000000c-0001-4000-8000-000000000002", title: "Collect from Tanvir Ahmed", reminder_type: "receivable", priority: "high", status: "overdue", due_date: "2026-02-20", related_module: "receivables", related_entity_id: "d0000005-0001-4000-8000-000000000004", note: "৳15,000 freelance sub-contract — overdue", is_demo: true },
  { id: "d000000c-0001-4000-8000-000000000003", title: "Pay Shopno Electronics", reminder_type: "payable", priority: "medium", status: "upcoming", due_date: "2026-03-20", related_module: "payables", related_entity_id: "d0000006-0001-4000-8000-000000000001", note: "AC installment ৳22,000", is_demo: true },
  { id: "d000000c-0001-4000-8000-000000000004", title: "Loan EMI — BRAC Bank", reminder_type: "loan", priority: "high", status: "upcoming", due_date: "2026-03-10", related_module: "loans", related_entity_id: "d0000007-0001-4000-8000-000000000001", note: "Monthly EMI ৳8,500", is_demo: true },
  { id: "d000000c-0001-4000-8000-000000000005", title: "Renew internet subscription", reminder_type: "custom", priority: "low", status: "upcoming", due_date: "2026-03-15", note: "ISP annual renewal", is_demo: true },
  { id: "d000000c-0001-4000-8000-000000000006", title: "Follow up Kamal — partial payment", reminder_type: "receivable", priority: "medium", status: "upcoming", due_date: "2026-03-10", related_module: "receivables", related_entity_id: "d0000005-0001-4000-8000-000000000002", note: "৳5,000 remaining from trip split", is_demo: true },
];

// --- Public API ---

export async function isDemoDataLoaded(): Promise<boolean> {
  const { count } = await (supabase as any)
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", true);
  return (count ?? 0) > 0;
}

export async function loadDemoData(): Promise<{ total: number }> {
  let total = 0;

  // Insert in dependency order using upsert to avoid duplicates
  const ops: { table: string; data: any[] }[] = [
    { table: "accounts", data: accounts },
    { table: "categories", data: categories },
    { table: "transactions", data: transactions },
    { table: "budgets", data: budgets },
    { table: "receivables", data: receivables },
    { table: "payables", data: payables },
    { table: "loans", data: loans },
    { table: "assets", data: assets },
    { table: "investments", data: investments },
    { table: "partnerships", data: partnerships },
    { table: "partnership_entries", data: partnershipEntries },
    { table: "reminders", data: reminders },
  ];

  for (const op of ops) {
    const { error } = await supabase.from(op.table as any).upsert(op.data as any, { onConflict: "id" });
    if (error) throw new Error(`Failed to seed ${op.table}: ${error.message}`);
    total += op.data.length;
  }

  // Also set premium plan and demo notifications for full testing
  localStorage.setItem("cc_plan", "yearly");
  localStorage.setItem("cc_notifications_v2", JSON.stringify([
    { id: "1", icon: "AlertTriangle", color: "text-warning", title: "Budget threshold reached", desc: "Shopping budget exceeded ৳10,000 limit", time: "2 min ago", read: false },
    { id: "2", icon: "Clock", color: "text-negative", title: "Receivable overdue", desc: "Tanvir Ahmed owes ৳15,000 — overdue", time: "1 hour ago", read: false },
    { id: "3", icon: "DollarSign", color: "text-primary", title: "Payable due soon", desc: "Shopno Electronics AC installment — ৳22,000 due Mar 20", time: "3 hours ago", read: false },
    { id: "4", icon: "CreditCard", color: "text-warning", title: "Loan EMI due", desc: "BRAC Bank EMI ৳8,500 due on March 10", time: "5 hours ago", read: false },
    { id: "5", icon: "Bell", color: "text-feature-reminders", title: "Reminder due today", desc: "Renew internet subscription — ISP annual renewal", time: "Today", read: false },
    { id: "6", icon: "ArrowUpRight", color: "text-positive", title: "New transaction added", desc: "Salary credited — ৳80,000", time: "Yesterday", read: true },
  ]));

  return { total };
}

export async function clearDemoData(): Promise<{ total: number }> {
  let total = 0;

  // Delete in child-to-parent order to respect FK constraints
  const tables = [
    "partnership_entries",
    "reminders",
    "receivable_entries",
    "payable_entries",
    "investments",
    "assets",
    "loans",
    "payables",
    "receivables",
    "receivable_books",
    "payable_books",
    "budgets",
    "transactions",
    "partnerships",
    "categories",
    "accounts",
  ];

  for (const table of tables) {
    const { data, error } = await (supabase as any)
      .from(table)
      .delete()
      .eq("is_demo", true)
      .select("id");
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
    total += data?.length ?? 0;
  }

  // Reset client-side demo state
  localStorage.removeItem("cc_plan");
  localStorage.removeItem("cc_notifications");
  localStorage.removeItem("cc_notifications_v2");

  return { total };
}
