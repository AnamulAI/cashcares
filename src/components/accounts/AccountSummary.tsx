import { Wallet, Building2, Smartphone, PiggyBank, Briefcase } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/config/app";
import { mockAccounts } from "@/data/mock-data";

export function AccountSummary() {
  const active = mockAccounts.filter(a => a.isActive);
  const cash = mockAccounts.filter(a => a.type === "cash").reduce((s, a) => s + a.balance, 0);
  const bank = mockAccounts.filter(a => a.type === "bank" || a.type === "savings").reduce((s, a) => s + a.balance, 0);
  const wallet = mockAccounts.filter(a => a.type === "mobile_wallet").reduce((s, a) => s + a.balance, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={<Briefcase className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Active Accounts" value={String(active.length)} trend="All accounts healthy" trendType="positive" />
      <StatCard icon={<Wallet className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Total Cash" value={formatCurrency(cash)} />
      <StatCard icon={<Building2 className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Bank Balance" value={formatCurrency(bank)} />
      <StatCard icon={<Smartphone className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Wallet Balance" value={formatCurrency(wallet)} />
    </div>
  );
}
