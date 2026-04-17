import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";
import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { useMemo } from "react";

export function BudgetProgress() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);

  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();

  const budgetItems = useMemo(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    return budgets.filter(b => b.is_active).map(b => {
      const spent = (transactions as any[])
        .filter(txn => txn.type === "expense" && txn.category_id === b.category_id && txn.date >= monthStart)
        .reduce((s: number, txn: any) => s + Number(txn.amount), 0);

      const limit = Number(b.allocated_amount);
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const status = pct >= 100 ? "over_limit" : pct >= 75 ? "warning" : "safe";

      return {
        id: b.id,
        categoryName: b.category?.name || "—",
        spent,
        limit,
        pct,
        status,
      };
    });
  }, [budgets, transactions]);

  return (
    <div className="finance-card-static finance-card-hover p-5">
      <SectionHeader title={t("dashboard.budgetProgress")} />
      <div className="mt-5 space-y-5">
        {budgetItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t("common.noData") || "No budget data yet"}
          </p>
        ) : (
          budgetItems.map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[13px]">{b.categoryName}</span>
                <StatusBadge status={b.status} />
              </div>
              <Progress value={Math.min(b.pct, 100)} className="h-2 rounded-full" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                <span className="tabular-nums">{fmt(b.spent)} {t("common.spent")}</span>
                <span className="tabular-nums">{fmt(b.limit)} {t("common.limit")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
