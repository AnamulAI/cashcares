import { mockBudgets } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/config/app";

export function BudgetProgress() {
  return (
    <div className="finance-card-static p-5">
      <SectionHeader title="Budget Progress" />
      <div className="mt-5 space-y-5">
        {mockBudgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const status = pct >= 100 ? "overdue" : pct >= 75 ? "pending" : "active";
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[13px]">{b.categoryName}</span>
                <StatusBadge status={status === "overdue" ? "overdue" : status === "pending" ? "pending" : "active"} />
              </div>
              <Progress value={Math.min(pct, 100)} className="h-2 rounded-full" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                <span className="tabular-nums">{formatCurrency(b.spent)} spent</span>
                <span className="tabular-nums">{formatCurrency(b.limit)} limit</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}