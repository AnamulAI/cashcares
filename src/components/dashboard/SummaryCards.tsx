import { Wallet, Globe, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { useAppContext } from "@/contexts/AppContext";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useAllReceivableEntries } from "@/hooks/use-receivable-entries";
import { useAllPayableEntries } from "@/hooks/use-payable-entries";
import { useLoans } from "@/hooks/use-loans";
import { useAssets } from "@/hooks/use-assets";
import { useInvestments } from "@/hooks/use-investments";
import { useSavingsPlans } from "@/hooks/use-savings";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatPercent } from "@/lib/formatters";

export function SummaryCards() {
  const { currency } = useAppContext();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: receivableEntries = [] } = useAllReceivableEntries();
  const { data: payableEntries = [] } = useAllPayableEntries();
  const { data: loans = [] } = useLoans();
  const { data: assets = [] } = useAssets();
  const { data: investments = [] } = useInvestments();
  const { data: savingsPlans = [] } = useSavingsPlans();
  const { t, lang } = useTranslation();

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  // Net Worth = accounts + assets + investments + savings + receivables - payables - debt
  const totalReceivable = receivableEntries
    .filter((r: any) => r.status !== "collected")
    .reduce((s: number, r: any) => s + (Number(r.amount) - Number(r.collected_amount)), 0);
  const totalPayable = payableEntries
    .filter((p: any) => p.status !== "paid")
    .reduce((s: number, p: any) => s + (Number(p.amount) - Number(p.paid_amount)), 0);
  const totalDebt = loans.filter(l => l.status !== "paid_off").reduce((s, l) => s + (Number(l.principal_amount) - Number(l.paid_amount)), 0);
  const totalAssets = assets.filter(a => a.status === "active").reduce((s, a) => s + Number(a.current_value), 0);
  const totalInvestments = investments.filter(i => i.status === "active").reduce((s, i) => s + Number(i.current_value), 0);
  const totalSavings = savingsPlans.filter(p => p.status !== "paused").reduce((s, p) => s + Number(p.total_saved), 0);

  const netWorth = totalBalance + totalAssets + totalInvestments + totalSavings + totalReceivable - totalPayable - totalDebt;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthTxns = transactions.filter((t: any) => t.date >= monthStart);
  const monthIncome = monthTxns.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const monthExpense = monthTxns.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  const fmt = (n: number) => formatAmount(n, currency, lang);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard icon={<Wallet className="h-5 w-5 text-feature-accounts" />} iconBg="bg-feature-accounts/10" label={t("dashboard.totalBalance")} value={fmt(totalBalance)} prominent />
      <StatCard icon={<Globe className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label={t("dashboard.netWorth")} value={fmt(netWorth)} prominent />
      <StatCard icon={<TrendingUp className="h-5 w-5 text-feature-income" />} iconBg="bg-feature-income/10" label={t("dashboard.thisMonthIncome")} value={fmt(monthIncome)} trendType="positive" />
      <StatCard icon={<TrendingDown className="h-5 w-5 text-feature-expense" />} iconBg="bg-feature-expense/10" label={t("dashboard.thisMonthExpense")} value={fmt(monthExpense)} trendType="negative" />
      <StatCard icon={<PieChart className="h-5 w-5 text-feature-budget" />} iconBg="bg-feature-budget/10" label={t("dashboard.budgetUsage")} value={formatPercent(monthExpense > 0 ? Math.round((monthExpense / (monthIncome || 1)) * 100) : 0, lang)} trendType="neutral" />
    </div>
  );
}
