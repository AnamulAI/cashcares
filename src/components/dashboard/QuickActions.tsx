import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, PieChart, HandCoins, CreditCard } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    { icon: ArrowDownLeft, labelKey: "action.addIncome", color: "text-positive", bg: "bg-positive/8 hover:bg-positive/12" },
    { icon: ArrowUpRight, labelKey: "action.addExpense", color: "text-negative", bg: "bg-negative/8 hover:bg-negative/12" },
    { icon: ArrowLeftRight, labelKey: "action.transfer", color: "text-primary", bg: "bg-primary/8 hover:bg-primary/12" },
    { icon: PieChart, labelKey: "action.addBudget", color: "text-warning", bg: "bg-warning/8 hover:bg-warning/12" },
    { icon: HandCoins, labelKey: "nav.receivables", color: "text-primary", bg: "bg-primary/8 hover:bg-primary/12" },
    { icon: CreditCard, labelKey: "nav.payables", color: "text-warning", bg: "bg-warning/8 hover:bg-warning/12" },
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
