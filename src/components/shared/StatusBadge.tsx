import { cn } from "@/lib/utils";

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
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize border",
      statusStyles[status] || "bg-muted text-muted-foreground border-border",
      className
    )}>
      {status}
    </span>
  );
}