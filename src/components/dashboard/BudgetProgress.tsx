import { mockBudgets } from "@/data/mock-data";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/config/app";

export function BudgetProgress() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <SectionHeader title="Budget Progress" />
      <div className="mt-4 space-y-4">
        {mockBudgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const status = pct >= 100 ? "overdue" : pct >= 75 ? "pending" : "active";
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium">{b.categoryName}</span>
                <StatusBadge status={status === "overdue" ? "overdue" : status === "pending" ? "pending" : "active"} />
              </div>
              <Progress value={Math.min(pct, 100)} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{formatCurrency(b.spent)} spent</span>
                <span>{formatCurrency(b.limit)} limit</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
