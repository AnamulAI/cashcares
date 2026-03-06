import { Wallet, Globe, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/config/app";
import { dashboardSummary } from "@/data/mock-data";

export function SummaryCards() {
  const s = dashboardSummary;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        icon={<Wallet className="h-5 w-5 text-primary" />}
        iconBg="bg-primary/10"
        label="Total Balance"
        value={formatCurrency(s.totalBalance)}
        trend="+3.2% from last month"
        trendType="positive"
      />
      <StatCard
        icon={<Globe className="h-5 w-5 text-primary" />}
        iconBg="bg-primary/10"
        label="Net Worth"
        value={formatCurrency(s.netWorth)}
        trend="+5.1% growth"
        trendType="positive"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-positive" />}
        iconBg="bg-positive/10"
        label="This Month Income"
        value={formatCurrency(s.monthIncome)}
        trend="+12% vs last month"
        trendType="positive"
      />
      <StatCard
        icon={<TrendingDown className="h-5 w-5 text-negative" />}
        iconBg="bg-negative/10"
        label="This Month Expense"
        value={formatCurrency(s.monthExpense)}
        trend="-8% vs last month"
        trendType="positive"
      />
      <StatCard
        icon={<PieChart className="h-5 w-5 text-warning" />}
        iconBg="bg-warning/10"
        label="Budget Usage"
        value={`${s.budgetUsage}%`}
        trend="4 of 5 budgets on track"
        trendType="neutral"
      />
    </div>
  );
}
