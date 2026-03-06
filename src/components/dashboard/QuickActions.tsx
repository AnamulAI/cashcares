import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, PieChart, HandCoins, CreditCard } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    { icon: ArrowDownLeft, labelKey: "action.addIncome", color: "text-feature-income", bg: "bg-feature-income/8 hover:bg-feature-income/12" },
    { icon: ArrowUpRight, labelKey: "action.addExpense", color: "text-feature-expense", bg: "bg-feature-expense/8 hover:bg-feature-expense/12" },
    { icon: ArrowLeftRight, labelKey: "action.transfer", color: "text-feature-transactions", bg: "bg-feature-transactions/8 hover:bg-feature-transactions/12" },
    { icon: PieChart, labelKey: "action.addBudget", color: "text-feature-budget", bg: "bg-feature-budget/8 hover:bg-feature-budget/12" },
    { icon: HandCoins, labelKey: "nav.receivables", color: "text-feature-receivables", bg: "bg-feature-receivables/8 hover:bg-feature-receivables/12" },
    { icon: CreditCard, labelKey: "nav.payables", color: "text-feature-payables", bg: "bg-feature-payables/8 hover:bg-feature-payables/12" },
  ];

  return (
    <div className="finance-card-static p-5">
      <SectionHeader title={t("dashboard.quickActions")} />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <button
            key={action.labelKey}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 text-left cursor-pointer",
              action.bg,
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card shadow-sm border">
              <action.icon className={cn("h-4 w-4", action.color)} />
            </div>
            <span className="text-foreground/80">{t(action.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
