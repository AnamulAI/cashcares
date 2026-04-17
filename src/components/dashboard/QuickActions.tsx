import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, PieChart, HandCoins, CreditCard } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { QuickAddModal } from "@/components/layout/QuickAddModal";
import { Dialog } from "@/components/ui/dialog";

export function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState("income");
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  const openQuickAdd = (tab: string) => {
    setQuickAddTab(tab);
    setQuickAddOpen(true);
  };

  const actions = [
    { icon: ArrowDownLeft, labelKey: "action.addIncome", color: "text-feature-income", bg: "bg-feature-income/8 hover:bg-feature-income/12", onClick: () => openQuickAdd("income") },
    { icon: ArrowUpRight, labelKey: "action.addExpense", color: "text-feature-expense", bg: "bg-feature-expense/8 hover:bg-feature-expense/12", onClick: () => openQuickAdd("expense") },
    { icon: ArrowLeftRight, labelKey: "action.transfer", color: "text-feature-transactions", bg: "bg-feature-transactions/8 hover:bg-feature-transactions/12", onClick: () => openQuickAdd("transfer") },
    { icon: PieChart, labelKey: "action.addBudget", color: "text-feature-budget", bg: "bg-feature-budget/8 hover:bg-feature-budget/12", onClick: () => navigate("/budgets") },
    { icon: HandCoins, labelKey: "nav.receivables", color: "text-feature-receivables", bg: "bg-feature-receivables/8 hover:bg-feature-receivables/12", onClick: () => navigate("/receivables") },
    { icon: CreditCard, labelKey: "nav.payables", color: "text-feature-payables", bg: "bg-feature-payables/8 hover:bg-feature-payables/12", onClick: () => navigate("/payables") },
  ];

  return (
    <div className="finance-card-static finance-card-hover p-5">
      <SectionHeader title={t("dashboard.quickActions")} />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <button
            key={action.labelKey}
            onClick={action.onClick}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 text-left cursor-pointer active:scale-[0.98]",
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

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} defaultTab={quickAddTab} />
    </div>
  );
}
