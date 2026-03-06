import type { Account, Transaction, Category, Budget, AlertItem } from "@/types/finance";

export const mockAccounts: Account[] = [
  { id: "a1", name: "Cash in Hand", type: "cash", balance: 12500, currency: "BDT", color: "#10b981", icon: "Wallet", isPrimary: true, isActive: true, lastUpdated: "2026-03-06" },
  { id: "a2", name: "Dutch Bangla Bank", type: "bank", balance: 185000, currency: "BDT", color: "#6366f1", icon: "Building2", isPrimary: false, isActive: true, lastUpdated: "2026-03-05" },
  { id: "a3", name: "bKash Personal", type: "mobile_wallet", balance: 8200, currency: "BDT", color: "#e11d48", icon: "Smartphone", isPrimary: false, isActive: true, lastUpdated: "2026-03-06" },
  { id: "a4", name: "BRAC Bank Savings", type: "savings", balance: 320000, currency: "BDT", color: "#f59e0b", icon: "PiggyBank", isPrimary: false, isActive: true, lastUpdated: "2026-03-01" },
  { id: "a5", name: "Nagad", type: "mobile_wallet", balance: 3500, currency: "BDT", color: "#f97316", icon: "Smartphone", isPrimary: false, isActive: true, lastUpdated: "2026-03-04" },
  { id: "a6", name: "Business Account", type: "business", balance: 450000, currency: "BDT", color: "#8b5cf6", icon: "Briefcase", isPrimary: false, isActive: true, lastUpdated: "2026-03-03" },
];

export const mockCategories: Category[] = [
  // Income
  { id: "c1", name: "Salary", group: "income", icon: "Banknote", color: "#10b981", usageCount: 12, isActive: true, usableInBudgets: false },
  { id: "c2", name: "Freelance", group: "income", icon: "Laptop", color: "#06b6d4", usageCount: 8, isActive: true, usableInBudgets: false },
  { id: "c3", name: "Business Revenue", group: "income", icon: "TrendingUp", color: "#8b5cf6", usageCount: 5, isActive: true, usableInBudgets: false },
  { id: "c4", name: "Rental Income", group: "income", icon: "Home", color: "#f59e0b", usageCount: 3, isActive: true, usableInBudgets: false },
  { id: "c5", name: "Gift Received", group: "income", icon: "Gift", color: "#ec4899", usageCount: 2, isActive: true, usableInBudgets: false },
  // Expense
  { id: "c6", name: "Food & Dining", group: "expense", icon: "UtensilsCrossed", color: "#f97316", usageCount: 45, isActive: true, usableInBudgets: true },
  { id: "c7", name: "Transport", group: "expense", icon: "Car", color: "#6366f1", usageCount: 22, isActive: true, usableInBudgets: true },
  { id: "c8", name: "Bills & Utilities", group: "expense", icon: "Zap", color: "#eab308", usageCount: 12, isActive: true, usableInBudgets: true },
  { id: "c9", name: "Shopping", group: "expense", icon: "ShoppingBag", color: "#ec4899", usageCount: 15, isActive: true, usableInBudgets: true },
  { id: "c10", name: "Education", group: "expense", icon: "GraduationCap", color: "#3b82f6", usageCount: 6, isActive: true, usableInBudgets: true },
  { id: "c11", name: "Health & Medical", group: "expense", icon: "Heart", color: "#ef4444", usageCount: 4, isActive: true, usableInBudgets: true },
  { id: "c12", name: "Training", group: "expense", icon: "BookOpen", color: "#14b8a6", usageCount: 3, isActive: true, usableInBudgets: true },
  { id: "c13", name: "Entertainment", group: "expense", icon: "Gamepad2", color: "#a855f7", usageCount: 9, isActive: true, usableInBudgets: true },
  { id: "c14", name: "Household", group: "expense", icon: "Home", color: "#78716c", usageCount: 18, isActive: true, usableInBudgets: true },
  // Savings
  { id: "c15", name: "Emergency Fund", group: "savings", icon: "Shield", color: "#10b981", usageCount: 6, isActive: true, usableInBudgets: false },
  { id: "c16", name: "Vacation Fund", group: "savings", icon: "Plane", color: "#06b6d4", usageCount: 3, isActive: true, usableInBudgets: false },
];

export const mockTransactions: Transaction[] = [
  { id: "t1", type: "income", categoryId: "c1", categoryName: "Salary", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 75000, date: "2026-03-01", note: "March salary", status: "completed" },
  { id: "t2", type: "expense", categoryId: "c6", categoryName: "Food & Dining", accountId: "a1", accountName: "Cash in Hand", amount: 850, date: "2026-03-06", note: "Lunch at office", status: "completed" },
  { id: "t3", type: "expense", categoryId: "c7", categoryName: "Transport", accountId: "a3", accountName: "bKash Personal", amount: 350, date: "2026-03-06", note: "Uber to office", status: "completed" },
  { id: "t4", type: "income", categoryId: "c2", categoryName: "Freelance", accountId: "a3", accountName: "bKash Personal", amount: 25000, date: "2026-03-04", note: "Website project", status: "completed" },
  { id: "t5", type: "expense", categoryId: "c8", categoryName: "Bills & Utilities", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 4500, date: "2026-03-03", note: "Internet bill", status: "completed" },
  { id: "t6", type: "transfer", categoryId: "", categoryName: "Transfer", accountId: "a2", accountName: "Dutch Bangla Bank", toAccountId: "a4", toAccountName: "BRAC Bank Savings", amount: 20000, date: "2026-03-02", note: "Monthly savings", status: "completed" },
  { id: "t7", type: "expense", categoryId: "c9", categoryName: "Shopping", accountId: "a1", accountName: "Cash in Hand", amount: 3200, date: "2026-03-05", note: "New headphones", status: "completed" },
  { id: "t8", type: "expense", categoryId: "c10", categoryName: "Education", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 15000, date: "2026-03-01", note: "Online course", status: "completed" },
  { id: "t9", type: "expense", categoryId: "c14", categoryName: "Household", accountId: "a1", accountName: "Cash in Hand", amount: 5500, date: "2026-03-04", note: "Groceries", status: "completed" },
  { id: "t10", type: "income", categoryId: "c3", categoryName: "Business Revenue", accountId: "a6", accountName: "Business Account", amount: 120000, date: "2026-03-01", note: "Client project payment", status: "completed" },
  { id: "t11", type: "expense", categoryId: "c11", categoryName: "Health & Medical", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 2500, date: "2026-03-02", note: "Doctor visit", status: "completed" },
  { id: "t12", type: "expense", categoryId: "c12", categoryName: "Training", accountId: "a3", accountName: "bKash Personal", amount: 8000, date: "2026-03-03", note: "Workshop fee", status: "pending" },
  { id: "t13", type: "expense", categoryId: "c6", categoryName: "Food & Dining", accountId: "a1", accountName: "Cash in Hand", amount: 1200, date: "2026-03-05", note: "Dinner with friends", status: "completed" },
  { id: "t14", type: "expense", categoryId: "c13", categoryName: "Entertainment", accountId: "a5", accountName: "Nagad", amount: 500, date: "2026-03-04", note: "Movie ticket", status: "completed" },
  { id: "t15", type: "transfer", categoryId: "", categoryName: "Transfer", accountId: "a1", accountName: "Cash in Hand", toAccountId: "a3", toAccountName: "bKash Personal", amount: 5000, date: "2026-03-05", note: "Top up bKash", status: "completed" },
  { id: "t16", type: "expense", categoryId: "c8", categoryName: "Bills & Utilities", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 3800, date: "2026-03-01", note: "Electricity bill", status: "completed" },
  { id: "t17", type: "income", categoryId: "c4", categoryName: "Rental Income", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 15000, date: "2026-03-01", note: "Flat rent", status: "completed" },
  { id: "t18", type: "expense", categoryId: "c7", categoryName: "Transport", accountId: "a1", accountName: "Cash in Hand", amount: 1500, date: "2026-03-03", note: "CNG fare", status: "completed" },
  { id: "t19", type: "expense", categoryId: "c9", categoryName: "Shopping", accountId: "a2", accountName: "Dutch Bangla Bank", amount: 7800, date: "2026-03-02", note: "Clothing", status: "completed" },
  { id: "t20", type: "expense", categoryId: "c6", categoryName: "Food & Dining", accountId: "a3", accountName: "bKash Personal", amount: 650, date: "2026-03-06", note: "Coffee shop", status: "completed" },
];

export const mockBudgets: Budget[] = [
  { id: "b1", categoryId: "c6", categoryName: "Food & Dining", limit: 15000, spent: 10700, icon: "UtensilsCrossed", color: "#f97316" },
  { id: "b2", categoryId: "c7", categoryName: "Transport", limit: 8000, spent: 5850, icon: "Car", color: "#6366f1" },
  { id: "b3", categoryId: "c8", categoryName: "Bills & Utilities", limit: 12000, spent: 8300, icon: "Zap", color: "#eab308" },
  { id: "b4", categoryId: "c9", categoryName: "Shopping", limit: 10000, spent: 11000, icon: "ShoppingBag", color: "#ec4899" },
  { id: "b5", categoryId: "c13", categoryName: "Entertainment", limit: 5000, spent: 2500, icon: "Gamepad2", color: "#a855f7" },
];

export const mockAlerts: AlertItem[] = [
  { id: "al1", type: "danger", title: "Shopping budget exceeded", description: "You've spent ৳11,000 of ৳10,000 limit", date: "Today" },
  { id: "al2", type: "warning", title: "Food budget at 71%", description: "৳10,700 spent of ৳15,000 limit", date: "Today" },
  { id: "al3", type: "info", title: "Upcoming: Internet Bill", description: "Due on March 15 — ৳4,500", date: "In 9 days" },
  { id: "al4", type: "warning", title: "Receivable overdue", description: "Rahim owes ৳5,000 — 3 days overdue", date: "Mar 3" },
  { id: "al5", type: "info", title: "Loan EMI due", description: "Monthly EMI ৳8,500 due on March 10", date: "In 4 days" },
];

// Dashboard summary
export const dashboardSummary = {
  totalBalance: 979200,
  netWorth: 1250000,
  monthIncome: 235000,
  monthExpense: 55350,
  budgetUsage: 76,
  savings: 320000,
  receivables: 45000,
  payables: 22000,
  debtLoans: 150000,
  investments: 280000,
  assets: 850000,
};

// Chart data
export const trendChartData = [
  { month: "Oct", income: 180000, expense: 62000 },
  { month: "Nov", income: 195000, expense: 71000 },
  { month: "Dec", income: 210000, expense: 85000 },
  { month: "Jan", income: 200000, expense: 58000 },
  { month: "Feb", income: 220000, expense: 67000 },
  { month: "Mar", income: 235000, expense: 55350 },
];

export const distributionData = [
  { name: "Bank", value: 635000, color: "#6366f1" },
  { name: "Cash", value: 12500, color: "#10b981" },
  { name: "Mobile Wallet", value: 11700, color: "#e11d48" },
  { name: "Business", value: 450000, color: "#8b5cf6" },
];
