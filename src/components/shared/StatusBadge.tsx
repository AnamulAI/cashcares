import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/useTranslation";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  completed: "bg-positive/10 text-positive border-positive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  recurring: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground border-border",
  active: "bg-positive/10 text-positive border-positive/20",
  inactive: "bg-muted text-muted-foreground border-border",
  overdue: "bg-negative/10 text-negative border-negative/20",
  open: "bg-primary/10 text-primary border-primary/20",
  partial: "bg-warning/10 text-warning border-warning/20",
  collected: "bg-positive/10 text-positive border-positive/20",
  paid: "bg-positive/10 text-positive border-positive/20",
  paid_off: "bg-positive/10 text-positive border-positive/20",
  sold: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
  closed: "bg-muted text-muted-foreground border-border",
  on_hold: "bg-warning/10 text-warning border-warning/20",
  settled: "bg-positive/10 text-positive border-positive/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  safe: "bg-positive/10 text-positive border-positive/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  over_limit: "bg-negative/10 text-negative border-negative/20",
};

const statusTranslationKey: Record<string, string> = {
  completed: "status.completed",
  pending: "status.pending",
  draft: "status.draft",
  active: "status.active",
  inactive: "status.inactive",
  overdue: "status.overdue",
  open: "status.open",
  partial: "status.partial",
  collected: "status.collected",
  paid: "status.paid",
  paid_off: "status.paidOff",
  sold: "status.sold",
  archived: "status.archived",
  closed: "status.closed",
  on_hold: "status.onHold",
  settled: "status.settled",
  paused: "status.paused",
  safe: "budgets.safe",
  warning: "budgets.warning",
  over_limit: "budgets.overLimitStatus",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const key = statusTranslationKey[status];
  const label = key ? t(key) : status;

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize border",
      statusStyles[status] || "bg-muted text-muted-foreground border-border",
      className
    )}>
      {label}
    </span>
  );
}
