export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "completed" | "pending" | "recurring" | "draft";
export type AccountType = "cash" | "bank" | "mobile_wallet" | "card" | "savings" | "business" | "shared";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isPrimary: boolean;
  isActive: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  group: CategoryGroup;
  icon: string;
  color: string;
  parentId?: string;
  usageCount: number;
  isActive: boolean;
  description?: string;
  usableInBudgets: boolean;
}

export type CategoryGroup =
  | "income"
  | "expense"
  | "savings"
  | "budget"
  | "asset"
  | "investment"
  | "receivable"
  | "payable"
  | "debt"
  | "credit_card";

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  accountId: string;
  accountName: string;
  toAccountId?: string;
  toAccountName?: string;
  amount: number;
  date: string;
  note?: string;
  status: TransactionStatus;
  tags?: string[];
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
}

export interface AlertItem {
  id: string;
  type: "warning" | "danger" | "info" | "success";
  title: string;
  description: string;
  date?: string;
}
