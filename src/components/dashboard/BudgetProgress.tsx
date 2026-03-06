import { mockBudgets } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";

export function BudgetProgress() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);

  return (
    <div className="finance-card-static p-5">
      <SectionHeader title={t("dashboard.budgetProgress")} />
      <div className="mt-5 space-y-5">
        {mockBudgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const status = pct >= 100 ? "over_limit" : pct >= 75 ? "warning" : "safe";
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[13px]">{b.categoryName}</span>
                <StatusBadge status={status} />
              </div>
              <Progress value={Math.min(pct, 100)} className="h-2 rounded-full" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                <span className="tabular-nums">{fmt(b.spent)} {t("common.spent")}</span>
                <span className="tabular-nums">{fmt(b.limit)} {t("common.limit")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
