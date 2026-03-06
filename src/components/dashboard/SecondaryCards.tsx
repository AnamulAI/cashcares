import { PiggyBank, HandCoins, CreditCard, Scale, TrendingUp, Building2 } from "lucide-react";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { formatCurrency } from "@/config/app";
import { dashboardSummary } from "@/data/mock-data";

export function SecondaryCards() {
  const s = dashboardSummary;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <FinanceCard icon={<PiggyBank className="h-4 w-4 text-positive" />} iconBg="bg-positive/10" label="Savings" value={formatCurrency(s.savings)} />
      <FinanceCard icon={<HandCoins className="h-4 w-4 text-primary" />} iconBg="bg-primary/10" label="Receivables" value={formatCurrency(s.receivables)} />
      <FinanceCard icon={<CreditCard className="h-4 w-4 text-warning" />} iconBg="bg-warning/10" label="Payables" value={formatCurrency(s.payables)} />
      <FinanceCard icon={<Scale className="h-4 w-4 text-negative" />} iconBg="bg-negative/10" label="Debt / Loans" value={formatCurrency(s.debtLoans)} />
      <FinanceCard icon={<TrendingUp className="h-4 w-4 text-primary" />} iconBg="bg-primary/10" label="Investments" value={formatCurrency(s.investments)} />
      <FinanceCard icon={<Building2 className="h-4 w-4 text-muted-foreground" />} iconBg="bg-muted" label="Assets" value={formatCurrency(s.assets)} />
    </div>
  );
}
