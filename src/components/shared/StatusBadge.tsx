import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  completed: "bg-positive/10 text-positive",
  pending: "bg-warning/10 text-warning",
  recurring: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
  active: "bg-positive/10 text-positive",
  inactive: "bg-muted text-muted-foreground",
  overdue: "bg-negative/10 text-negative",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      statusStyles[status] || "bg-muted text-muted-foreground",
      className
    )}>
      {status}
    </span>
  );
}
