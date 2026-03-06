import { Wallet, Globe, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { useAppContext } from "@/contexts/AppContext";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";

export function SummaryCards() {
  const { currency } = useAppContext();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { t } = useTranslation();

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthTxns = transactions.filter((t: any) => t.date >= monthStart);
  const monthIncome = monthTxns.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const monthExpense = monthTxns.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const fmt = (n: number) => formatAmount(n, currency, lang);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard icon={<Wallet className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label={t("dashboard.totalBalance")} value={fmt(totalBalance)} prominent />
      <StatCard icon={<Globe className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label={t("dashboard.netWorth")} value={fmt(totalBalance)} prominent />
      <StatCard icon={<TrendingUp className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("dashboard.thisMonthIncome")} value={fmt(monthIncome)} trendType="positive" />
      <StatCard icon={<TrendingDown className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("dashboard.thisMonthExpense")} value={fmt(monthExpense)} trendType="negative" />
      <StatCard icon={<PieChart className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label={t("dashboard.budgetUsage")} value={formatPercent(monthExpense > 0 ? Math.round((monthExpense / (monthIncome || 1)) * 100) : 0, lang)} trendType="neutral" />
    </div>
  );
}
