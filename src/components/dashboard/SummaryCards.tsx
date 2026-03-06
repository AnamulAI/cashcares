import { Wallet, Globe, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/config/app";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";

export function SummaryCards() {
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthTxns = transactions.filter((t: any) => t.date >= monthStart);
  const monthIncome = monthTxns.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const monthExpense = monthTxns.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard icon={<Wallet className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Balance" value={formatCurrency(totalBalance)} prominent />
      <StatCard icon={<Globe className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Net Worth" value={formatCurrency(totalBalance)} prominent />
      <StatCard icon={<TrendingUp className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="This Month Income" value={formatCurrency(monthIncome)} trendType="positive" />
      <StatCard icon={<TrendingDown className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="This Month Expense" value={formatCurrency(monthExpense)} trendType="negative" />
      <StatCard icon={<PieChart className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Budget Usage" value={monthExpense > 0 ? `${Math.round((monthExpense / (monthIncome || 1)) * 100)}%` : "0%"} trendType="neutral" />
    </div>
  );
}
