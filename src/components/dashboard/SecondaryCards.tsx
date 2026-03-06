import { PiggyBank, HandCoins, CreditCard, Scale, TrendingUp, Building2 } from "lucide-react";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { formatCurrency } from "@/config/app";
import { useAccounts } from "@/hooks/use-accounts";

export function SecondaryCards() {
  const { data: accounts = [] } = useAccounts();
  const savings = accounts.filter(a => a.type === "savings").reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <FinanceCard icon={<PiggyBank className="h-[18px] w-[18px] text-positive" />} iconBg="bg-positive/10" label="Savings" value={formatCurrency(savings)} />
      <FinanceCard icon={<HandCoins className="h-[18px] w-[18px] text-primary" />} iconBg="bg-primary/10" label="Receivables" value={formatCurrency(0)} />
      <FinanceCard icon={<CreditCard className="h-[18px] w-[18px] text-warning" />} iconBg="bg-warning/10" label="Payables" value={formatCurrency(0)} />
      <FinanceCard icon={<Scale className="h-[18px] w-[18px] text-negative" />} iconBg="bg-negative/10" label="Debt / Loans" value={formatCurrency(0)} />
      <FinanceCard icon={<TrendingUp className="h-[18px] w-[18px] text-primary" />} iconBg="bg-primary/10" label="Investments" value={formatCurrency(0)} />
      <FinanceCard icon={<Building2 className="h-[18px] w-[18px] text-muted-foreground" />} iconBg="bg-muted" label="Assets" value={formatCurrency(0)} />
    </div>
  );
}
