import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PiggyBank, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Progress } from "@/components/ui/progress";
import { useSavingsPlans } from "@/hooks/use-savings";
import { useAllInstallments } from "@/hooks/use-savings";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";

export function SavingsProgressCard() {
  const { currency } = useAppContext();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { data: plans = [] } = useSavingsPlans();
  const { data: installments = [] } = useAllInstallments();

  const fmt = (n: number) => formatAmount(n, currency, lang);

  const items = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const active = plans.filter(p => p.status === "active");
    return active
      .map(p => {
        const planInst = installments.filter(i => i.plan_id === p.id);
        const next = planInst
          .filter(i => i.status !== "paid")
          .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
        return {
          plan: p,
          nextDue: next?.due_date || null,
          nextAmount: next ? Number(next.amount) : 0,
          isOverdue: next ? next.due_date < today : false,
        };
      })
      .sort((a, b) => {
        if (!a.nextDue) return 1;
        if (!b.nextDue) return -1;
        return a.nextDue.localeCompare(b.nextDue);
      })
      .slice(0, 4);
  }, [plans, installments]);

  return (
    <div className="finance-card-static finance-card-hover p-5">
      <SectionHeader title={t("dashboard.savingsProgress") || "Savings Progress"} />
      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <PiggyBank className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No active savings plans</p>
          </div>
        ) : (
          items.map(({ plan, nextDue, nextAmount, isOverdue }) => {
            const target = Number(plan.target_amount);
            const saved = Number(plan.total_saved);
            const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
            return (
              <button
                key={plan.id}
                onClick={() => navigate("/savings")}
                className="w-full text-left group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[13px] truncate">{plan.plan_name}</p>
                    {plan.recipient_name && (
                      <p className="text-[11px] text-muted-foreground truncate">{plan.recipient_name}</p>
                    )}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5" />
                </div>
                {plan.plan_type === "fixed" ? (
                  <>
                    <Progress value={pct} className="h-2 rounded-full" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                      <span className="tabular-nums">{fmt(saved)} saved</span>
                      <span className="tabular-nums">{pct}% of {fmt(target)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    Open-ended · {fmt(saved)} saved
                  </p>
                )}
                {nextDue && (
                  <p className={`text-[11px] mt-1 tabular-nums ${isOverdue ? "text-negative font-medium" : "text-muted-foreground"}`}>
                    {isOverdue ? "Overdue: " : "Next due: "}
                    {formatAppDate(nextDue)} · {fmt(nextAmount)}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
