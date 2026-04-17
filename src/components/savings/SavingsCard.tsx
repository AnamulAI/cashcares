import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Calendar } from "lucide-react";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { useAppContext } from "@/contexts/AppContext";
import type { SavingsPlan } from "@/hooks/use-savings";

interface Props {
  plan: SavingsPlan;
  nextDue?: string;
  onClick: () => void;
}

export function SavingsCard({ plan, nextDue, onClick }: Props) {
  const { currency } = useAppContext();
  const pct = plan.target_amount > 0
    ? Math.min(100, Math.round((Number(plan.total_saved) / Number(plan.target_amount)) * 100))
    : 0;

  const statusVariant =
    plan.status === "completed" ? "default" :
    plan.status === "paused" ? "secondary" : "outline";

  return (
    <div onClick={onClick} className="finance-card p-5 cursor-pointer hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-feature-savings/10 shrink-0">
            <PiggyBank className="h-5 w-5 text-feature-savings" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[15px] truncate">{plan.plan_name}</p>
            {plan.recipient_name && (
              <p className="text-xs text-muted-foreground truncate">{plan.recipient_name}</p>
            )}
          </div>
        </div>
        <Badge variant={statusVariant as any} className="capitalize shrink-0">{plan.status}</Badge>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-xl font-bold font-display">
          {formatAmount(Number(plan.total_saved), currency)}
        </p>
        {plan.plan_type === "fixed" && (
          <p className="text-xs text-muted-foreground">
            of {formatAmount(Number(plan.target_amount), currency)}
          </p>
        )}
      </div>

      {plan.plan_type === "fixed" && (
        <div className="mt-2 space-y-1">
          <Progress value={pct} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground">{pct}% complete</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatAmount(Number(plan.installment_amount), currency)} / {plan.frequency}</span>
        {nextDue && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatAppDate(nextDue)}
          </span>
        )}
      </div>
    </div>
  );
}
