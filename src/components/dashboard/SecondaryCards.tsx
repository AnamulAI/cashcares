import { PiggyBank, HandCoins, CreditCard, Scale, TrendingUp, Building2 } from "lucide-react";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { useAppContext } from "@/contexts/AppContext";
import { useAccounts } from "@/hooks/use-accounts";
import { useAllPayableEntries } from "@/hooks/use-payable-entries";
import { useAllReceivableEntries } from "@/hooks/use-receivable-entries";
import { useLoans } from "@/hooks/use-loans";
import { useAssets } from "@/hooks/use-assets";
import { useInvestments } from "@/hooks/use-investments";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";

export function SecondaryCards() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);

  const { data: accounts = [] } = useAccounts();
  const { data: receivableEntries = [] } = useAllReceivableEntries();
  const { data: payableEntries = [] } = useAllPayableEntries();
  const { data: loans = [] } = useLoans();
  const { data: assets = [] } = useAssets();
  const { data: investments = [] } = useInvestments();

  const savings = accounts.filter(a => a.type === "savings").reduce((s, a) => s + Number(a.balance), 0);
  const totalReceivable = receivableEntries
    .filter((r: any) => r.status !== "collected")
    .reduce((s: number, r: any) => s + (Number(r.amount) - Number(r.collected_amount)), 0);
  const totalPayable = payableEntries
    .filter((p: any) => p.status !== "paid")
    .reduce((s: number, p: any) => s + (Number(p.amount) - Number(p.paid_amount)), 0);
  const totalDebt = loans.filter(l => l.status !== "paid_off").reduce((s, l) => s + (Number(l.principal_amount) - Number(l.paid_amount)), 0);
  const totalInvestments = investments.filter(i => i.status === "active").reduce((s, i) => s + Number(i.current_value), 0);
  const totalAssets = assets.filter(a => a.status === "active").reduce((s, a) => s + Number(a.current_value), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <FinanceCard icon={<PiggyBank className="h-[18px] w-[18px] text-feature-savings" />} iconBg="bg-feature-savings/10" label={t("dashboard.savings")} value={fmt(savings)} />
      <FinanceCard icon={<HandCoins className="h-[18px] w-[18px] text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("dashboard.receivables")} value={fmt(totalReceivable)} />
      <FinanceCard icon={<CreditCard className="h-[18px] w-[18px] text-feature-payables" />} iconBg="bg-feature-payables/10" label={t("dashboard.payables")} value={fmt(totalPayable)} />
      <FinanceCard icon={<Scale className="h-[18px] w-[18px] text-feature-debt" />} iconBg="bg-feature-debt/10" label={t("dashboard.debtLoans")} value={fmt(totalDebt)} />
      <FinanceCard icon={<TrendingUp className="h-[18px] w-[18px] text-feature-investments" />} iconBg="bg-feature-investments/10" label={t("dashboard.investments")} value={fmt(totalInvestments)} />
      <FinanceCard icon={<Building2 className="h-[18px] w-[18px] text-feature-assets" />} iconBg="bg-feature-assets/10" label={t("dashboard.assets")} value={fmt(totalAssets)} />
    </div>
  );
}
